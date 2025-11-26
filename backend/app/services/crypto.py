"""
Token encryption/decryption service using Fernet (AES-128 symmetric encryption).

This module provides secure encryption for OAuth tokens stored in MongoDB.
The encryption key must be provided via TOKEN_ENCRYPTION_KEY environment variable.
"""

import logging
from cryptography.fernet import Fernet, InvalidToken
from app.config import settings

logger = logging.getLogger(__name__)


class TokenEncryptionError(Exception):
    """Raised when token encryption/decryption fails."""
    pass


class CryptoService:
    """
    Service for encrypting and decrypting OAuth tokens.
    
    Uses Fernet symmetric encryption (AES-128 in CBC mode with HMAC for authentication).
    """
    
    def __init__(self):
        """Initialize the crypto service with the encryption key."""
        try:
            key = settings.token_encryption_key.encode()
            self.cipher = Fernet(key)
            logger.info("CryptoService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize CryptoService: {e}")
            raise TokenEncryptionError(
                "Invalid TOKEN_ENCRYPTION_KEY. Generate one using: "
                "python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"
            ) from e
    
    def encrypt_token(self, token: str) -> str:
        """
        Encrypt a token string.
        
        Args:
            token: Plain text token to encrypt
            
        Returns:
            Base64-encoded encrypted token
            
        Raises:
            TokenEncryptionError: If encryption fails
        """
        try:
            encrypted = self.cipher.encrypt(token.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Token encryption failed: {e}")
            raise TokenEncryptionError("Failed to encrypt token") from e
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """
        Decrypt an encrypted token.
        
        Args:
            encrypted_token: Base64-encoded encrypted token
            
        Returns:
            Plain text token
            
        Raises:
            TokenEncryptionError: If decryption fails or token is invalid
        """
        try:
            decrypted = self.cipher.decrypt(encrypted_token.encode())
            return decrypted.decode()
        except InvalidToken as e:
            logger.error("Invalid token or wrong encryption key")
            raise TokenEncryptionError("Invalid encrypted token or wrong encryption key") from e
        except Exception as e:
            logger.error(f"Token decryption failed: {e}")
            raise TokenEncryptionError("Failed to decrypt token") from e


crypto_service = CryptoService()
