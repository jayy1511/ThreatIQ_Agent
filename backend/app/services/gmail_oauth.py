"""
Gmail OAuth 2.0 service for authorization code flow.

Handles OAuth URL generation, token exchange, refresh, and storage.
"""

import logging
import secrets
import time
from typing import Optional, Dict
from urllib.parse import urlencode
import httpx
from app.config import settings
from app.models.database import Database
from app.services.crypto import crypto_service

logger = logging.getLogger(__name__)


class GmailOAuthError(Exception):
    """Raised when Gmail OAuth operations fail."""
    pass


class GmailOAuthService:
    """
    Service for Gmail OAuth 2.0 authorization code flow.
    
    Implements secure OAuth with state parameter for CSRF protection.
    Tokens are encrypted before storage in MongoDB.
    """
    
    OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
    OAUTH_REVOKE_URL = "https://oauth2.googleapis.com/revoke"
    OAUTH_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    SCOPES = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/userinfo.email",
    ]
    
    def __init__(self):
        """Initialize the OAuth service."""
        self.client_id = settings.google_client_id
        self.client_secret = settings.google_client_secret
        self.redirect_uri = settings.google_redirect_uri
        logger.info("GmailOAuthService initialized")
    
    def build_auth_url(self, user_id: str) -> Dict[str, str]:
        """
        Build OAuth authorization URL with state parameter.
        
        State parameter binds the request to the user's Firebase UID for CSRF protection.
        
        Args:
            user_id: Firebase user ID
            
        Returns:
            Dict with 'url' and 'state'
        """
        state = secrets.token_urlsafe(32)
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": f"{user_id}:{state}",
        }
        
        url = f"{self.OAUTH_AUTHORIZE_URL}?{urlencode(params)}"
        logger.info(f"Generated auth URL for user: {user_id}")
        
        return {"url": url, "state": state}
    
    async def exchange_code_for_tokens(self, code: str, state: str) -> Dict[str, str]:
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            code: Authorization code from OAuth callback
            state: State parameter from OAuth callback (format: "user_id:random_state")
            
        Returns:
            Dict with tokens and user_id
            
        Raises:
            GmailOAuthError: If token exchange fails
        """
        try:
            user_id = state.split(":")[0] if ":" in state else None
            if not user_id:
                raise GmailOAuthError("Invalid state parameter")
            
            data = {
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": self.redirect_uri,
                "grant_type": "authorization_code",
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.OAUTH_TOKEN_URL, data=data)
                
                if response.status_code != 200:
                    logger.error(f"Token exchange failed: {response.text}")
                    raise GmailOAuthError(f"Token exchange failed: {response.status_code}")
                
                token_data = response.json()
                
                user_email = await self._get_user_email(token_data["access_token"])
                
                await self.store_tokens(user_id, token_data, user_email)
                
                logger.info(f"Successfully exchanged code for tokens for user: {user_id}")
                return {"user_id": user_id, "email": user_email}
                
        except GmailOAuthError:
            raise
        except Exception as e:
            logger.error(f"Error exchanging code for tokens: {e}", exc_info=True)
            raise GmailOAuthError("Failed to exchange authorization code") from e
    
    async def _get_user_email(self, access_token: str) -> str:
        """
        Get user email from Google userinfo endpoint.
        
        Args:
            access_token: Valid access token
            
        Returns:
            User's Gmail email address
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    self.OAUTH_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    userinfo = response.json()
                    return userinfo.get("email", "")
                
                return ""
        except Exception as e:
            logger.warning(f"Failed to get user email: {e}")
            return ""
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, any]:
        """
        Refresh an expired access token.
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            Dict with new access_token and expires_in
            
        Raises:
            GmailOAuthError: If token refresh fails
        """
        try:
            data = {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.OAUTH_TOKEN_URL, data=data)
                
                if response.status_code != 200:
                    logger.error(f"Token refresh failed: {response.text}")
                    raise GmailOAuthError(f"Token refresh failed: {response.status_code}")
                
                token_data = response.json()
                logger.info("Successfully refreshed access token")
                
                return {
                    "access_token": token_data["access_token"],
                    "expires_in": token_data.get("expires_in", 3600),
                }
                
        except GmailOAuthError:
            raise
        except Exception as e:
            logger.error(f"Error refreshing token: {e}", exc_info=True)
            raise GmailOAuthError("Failed to refresh access token") from e
    
    async def store_tokens(self, user_id: str, token_data: Dict, email: str) -> None:
        """
        Encrypt and store OAuth tokens in MongoDB.
        
        Args:
            user_id: Firebase user ID
            token_data: Token response from Google (access_token, refresh_token, expires_in)
            email: User's Gmail email
        """
        try:
            encrypted_access = crypto_service.encrypt_token(token_data["access_token"])
            encrypted_refresh = crypto_service.encrypt_token(token_data["refresh_token"])
            
            expiry_ts = int(time.time()) + token_data.get("expires_in", 3600)
            
            db = Database.get_db()
            tokens_collection = db["gmail_tokens"]
            
            await tokens_collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "email": email,
                        "scopes": self.SCOPES,
                        "encrypted_access_token": encrypted_access,
                        "encrypted_refresh_token": encrypted_refresh,
                        "expiry_ts": expiry_ts,
                        "updated_at": time.time(),
                    },
                    "$setOnInsert": {
                        "created_at": time.time(),
                    }
                },
                upsert=True
            )
            
            logger.info(f"Stored encrypted tokens for user: {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing tokens: {e}", exc_info=True)
            raise GmailOAuthError("Failed to store tokens") from e
    
    async def get_tokens(self, user_id: str) -> Optional[Dict[str, any]]:
        """
        Retrieve and decrypt OAuth tokens for a user.
        Auto-refreshes if token is expired.
        
        Args:
            user_id: Firebase user ID
            
        Returns:
            Dict with access_token, refresh_token, email, scopes or None if not found
            
        Raises:
            GmailOAuthError: If token retrieval or refresh fails
        """
        try:
            db = Database.get_db()
            tokens_collection = db["gmail_tokens"]
            
            token_doc = await tokens_collection.find_one({"user_id": user_id})
            
            if not token_doc:
                return None
            
            current_time = int(time.time())
            is_expired = token_doc["expiry_ts"] <= current_time + 300
            
            if is_expired:
                logger.info(f"Token expired for user {user_id}, refreshing...")
                encrypted_refresh = token_doc["encrypted_refresh_token"]
                refresh_token = crypto_service.decrypt_token(encrypted_refresh)
                
                new_token_data = await self.refresh_access_token(refresh_token)
                
                encrypted_access = crypto_service.encrypt_token(new_token_data["access_token"])
                expiry_ts = int(time.time()) + new_token_data["expires_in"]
                
                await tokens_collection.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {
                            "encrypted_access_token": encrypted_access,
                            "expiry_ts": expiry_ts,
                            "updated_at": time.time(),
                        }
                    }
                )
                
                access_token = new_token_data["access_token"]
            else:
                encrypted_access = token_doc["encrypted_access_token"]
                access_token = crypto_service.decrypt_token(encrypted_access)
            
            encrypted_refresh = token_doc["encrypted_refresh_token"]
            refresh_token = crypto_service.decrypt_token(encrypted_refresh)
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "email": token_doc.get("email", ""),
                "scopes": token_doc.get("scopes", []),
            }
            
        except Exception as e:
            logger.error(f"Error getting tokens for user {user_id}: {e}", exc_info=True)
            raise GmailOAuthError("Failed to retrieve tokens") from e
    
    async def revoke_tokens(self, user_id: str) -> bool:
        """
        Revoke and delete OAuth tokens for a user.
        
        Args:
            user_id: Firebase user ID
            
        Returns:
            True if tokens were deleted, False if no tokens found
        """
        try:
            db = Database.get_db()
            tokens_collection = db["gmail_tokens"]
            
            token_doc = await tokens_collection.find_one({"user_id": user_id})
            
            if not token_doc:
                return False
            
            try:
                encrypted_access = token_doc["encrypted_access_token"]
                access_token = crypto_service.decrypt_token(encrypted_access)
                
                async with httpx.AsyncClient(timeout=10.0) as client:
                    await client.post(
                        self.OAUTH_REVOKE_URL,
                        data={"token": access_token}
                    )
            except Exception as e:
                logger.warning(f"Failed to revoke token with Google: {e}")
            
            result = await tokens_collection.delete_one({"user_id": user_id})
            
            logger.info(f"Deleted tokens for user: {user_id}")
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error revoking tokens: {e}", exc_info=True)
            raise GmailOAuthError("Failed to revoke tokens") from e


gmail_oauth_service = GmailOAuthService()
