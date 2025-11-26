"""
Gmail API client for reading messages and managing labels.

Wraps the Google Gmail API with error handling and retries.
"""

import logging
import base64
import time
from typing import List, Dict, Optional
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials

logger = logging.getLogger(__name__)


class GmailClientError(Exception):
    """Raised when Gmail API operations fail."""
    pass


class GmailClient:
    """
    Client for Gmail API operations.
    
    Provides methods for listing messages, parsing content, and managing labels.
    """
    
    def __init__(self, access_token: str):
        """
        Initialize Gmail API client with access token.
        
        Args:
            access_token: Valid OAuth 2.0 access token
        """
        try:
            credentials = Credentials(token=access_token)
            self.service = build('gmail', 'v1', credentials=credentials, cache_discovery=False)
            self.labels_cache = None
            logger.info("GmailClient initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gmail client: {e}")
            raise GmailClientError("Failed to initialize Gmail API client") from e
    
    def list_unread_messages(self, max_results: int = 10) -> List[Dict]:
        """
        List unread messages in the inbox.
        
        Args:
            max_results: Maximum number of messages to retrieve (default: 10)
            
        Returns:
            List of message objects with id and threadId
            
        Raises:
            GmailClientError: If API call fails
        """
        try:
            response = self.service.users().messages().list(
                userId='me',
                q='is:unread',
                maxResults=max_results
            ).execute()
            
            messages = response.get('messages', [])
            logger.info(f"Found {len(messages)} unread messages")
            
            return messages
            
        except HttpError as e:
            logger.error(f"Gmail API error listing messages: {e}")
            raise GmailClientError(f"Failed to list messages: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error listing messages: {e}", exc_info=True)
            raise GmailClientError("Failed to list messages") from e
    
    def get_message(self, message_id: str) -> Dict:
        """
        Get full message details.
        
        Args:
            message_id: Gmail message ID
            
        Returns:
            Full message object with headers and payload
            
        Raises:
            GmailClientError: If API call fails
        """
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            return message
            
        except HttpError as e:
            logger.error(f"Gmail API error getting message {message_id}: {e}")
            raise GmailClientError(f"Failed to get message: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error getting message: {e}", exc_info=True)
            raise GmailClientError("Failed to get message") from e
    
    def parse_message_body(self, message: Dict) -> str:
        """
        Extract plain text body from message.
        
        Handles base64url encoding and multipart messages.
        
        Args:
            message: Full message object from get_message()
            
        Returns:
            Plain text body content (empty string if not found)
        """
        try:
            payload = message.get('payload', {})
            
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        if data:
                            return self._decode_base64url(data)
                    
                    if 'parts' in part:
                        for subpart in part['parts']:
                            if subpart['mimeType'] == 'text/plain':
                                data = subpart['body'].get('data', '')
                                if data:
                                    return self._decode_base64url(data)
            else:
                data = payload.get('body', {}).get('data', '')
                if data:
                    return self._decode_base64url(data)
            
            snippet = message.get('snippet', '')
            return snippet
            
        except Exception as e:
            logger.warning(f"Error parsing message body: {e}")
            return message.get('snippet', '')
    
    def _decode_base64url(self, data: str) -> str:
        """
        Decode base64url encoded string.
        
        Args:
            data: Base64url encoded string
            
        Returns:
            Decoded UTF-8 string
        """
        try:
            decoded_bytes = base64.urlsafe_b64decode(data)
            return decoded_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"Error decoding base64url: {e}")
            return ""
    
    def get_header(self, message: Dict, header_name: str) -> str:
        """
        Extract a specific header from message.
        
        Args:
            message: Full message object
            header_name: Header name (e.g., 'From', 'Subject', 'Date')
            
        Returns:
            Header value or empty string if not found
        """
        headers = message.get('payload', {}).get('headers', [])
        for header in headers:
            if header['name'].lower() == header_name.lower():
                return header['value']
        return ""
    
    def ensure_labels_exist(self) -> Dict[str, str]:
        """
        Ensure ThreatIQ labels exist, create if missing.
        
        Creates three labels:
        - ThreatIQ/Safe
        - ThreatIQ/Suspicious
        - ThreatIQ/Phishing
        
        Returns:
            Dict mapping label names to label IDs
            
        Raises:
            GmailClientError: If label creation fails
        """
        try:
            if self.labels_cache:
                return self.labels_cache
            
            existing_labels = self.service.users().labels().list(userId='me').execute()
            labels_by_name = {label['name']: label['id'] for label in existing_labels.get('labels', [])}
            
            required_labels = {
                'ThreatIQ/Safe': 'SAFE',
                'ThreatIQ/Suspicious': 'SUSPICIOUS',
                'ThreatIQ/Phishing': 'PHISHING'
            }
            
            label_ids = {}
            
            for label_name, category in required_labels.items():
                if label_name in labels_by_name:
                    label_ids[category] = labels_by_name[label_name]
                    logger.info(f"Label '{label_name}' already exists")
                else:
                    logger.info(f"Creating label: {label_name}")
                    label_object = {
                        'name': label_name,
                        'labelListVisibility': 'labelShow',
                        'messageListVisibility': 'show'
                    }
                    
                    created_label = self.service.users().labels().create(
                        userId='me',
                        body=label_object
                    ).execute()
                    
                    label_ids[category] = created_label['id']
                    logger.info(f"Created label '{label_name}' with ID: {created_label['id']}")
            
            self.labels_cache = label_ids
            return label_ids
            
        except HttpError as e:
            logger.error(f"Gmail API error ensuring labels: {e}")
            raise GmailClientError(f"Failed to ensure labels exist: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error ensuring labels: {e}", exc_info=True)
            raise GmailClientError("Failed to ensure labels exist") from e
    
    def apply_label(self, message_id: str, label_id: str) -> bool:
        """
        Apply a label to a message.
        
        Args:
            message_id: Gmail message ID
            label_id: Label ID to apply
            
        Returns:
            True if successful
            
        Raises:
            GmailClientError: If API call fails
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'addLabelIds': [label_id]}
            ).execute()
            
            logger.info(f"Applied label {label_id} to message {message_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Gmail API error applying label: {e}")
            raise GmailClientError(f"Failed to apply label: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error applying label: {e}", exc_info=True)
            raise GmailClientError("Failed to apply label") from e
    
    def mark_as_spam(self, message_id: str) -> bool:
        """
        Mark a message as spam.
        
        Args:
            message_id: Gmail message ID
            
        Returns:
            True if successful
            
        Raises:
            GmailClientError: If API call fails
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'addLabelIds': ['SPAM']}
            ).execute()
            
            logger.info(f"Marked message {message_id} as spam")
            return True
            
        except HttpError as e:
            logger.error(f"Gmail API error marking as spam: {e}")
            raise GmailClientError(f"Failed to mark as spam: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error marking as spam: {e}", exc_info=True)
            raise GmailClientError("Failed to mark as spam") from e
    
    def archive_message(self, message_id: str) -> bool:
        """
        Archive a message (remove from INBOX).
        
        Args:
            message_id: Gmail message ID
            
        Returns:
            True if successful
            
        Raises:
            GmailClientError: If API call fails
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['INBOX']}
            ).execute()
            
            logger.info(f"Archived message {message_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Gmail API error archiving message: {e}")
            raise GmailClientError(f"Failed to archive message: {e.status_code}") from e
        except Exception as e:
            logger.error(f"Error archiving message: {e}", exc_info=True)
            raise GmailClientError("Failed to archive message") from e
