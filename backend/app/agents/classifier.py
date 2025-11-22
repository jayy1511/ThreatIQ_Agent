import google.generativeai as genai
from app.config import settings
from typing import Dict, List
import logging
import json

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=settings.gemini_api_key)


class ClassifierAgent:
    """
    Classifier Agent - Analyzes messages and produces structured classification.
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.system_instruction = """You are a phishing detection expert. Your job is to analyze emails and messages to determine if they are phishing attempts, safe, or unclear.

Analyze the message for these red flags:
- Suspicious URLs or domains
- Urgent/threatening language
- Requests for sensitive information
- Sender email mismatch
- Spelling/grammar errors
- Too-good-to-be-true offers
- Impersonation of known brands

Return your analysis as a JSON object with this EXACT structure:
{
    "label": "phishing" or "safe" or "unclear",
    "confidence": 0.0 to 1.0,
    "reason_tags": ["tag1", "tag2", ...],
    "explanation": "Brief explanation of your decision"
}

Possible reason_tags:
- suspicious_link
- urgent_language
- sender_mismatch
- requests_credentials
- spelling_errors
- impersonation
- too_good_to_be_true
- unknown_sender
- generic_greeting
- suspicious_attachment

Be thorough but concise. Focus on concrete evidence."""
    
    async def classify(self, message: str) -> Dict:
        """
        Classify a message as phishing, safe, or unclear.
        
        Args:
            message: The message to classify
            
        Returns:
            Dictionary with label, confidence, reason_tags, and explanation
        """
        try:
            prompt = f"""Analyze this message for phishing:

MESSAGE:
{message}

Provide your analysis in the exact JSON format specified."""
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    top_p=0.8,
                    top_k=40,
                    response_mime_type="application/json"  # Force JSON output
                )
            )
            
            # Get response text
            response_text = response.text.strip()
            logger.info(f"Raw Gemini response: {response_text[:200]}...")
            
            # Multiple strategies to extract JSON
            json_text = response_text
            
            # Strategy 1: Remove markdown code blocks
            if '```' in json_text:
                parts = json_text.split('```')
                for part in parts:
                    if part.strip().startswith('json'):
                        json_text = part[4:].strip()
                        break
                    elif '{' in part and '}' in part:
                        json_text = part.strip()
                        break
            
            # Strategy 2: Extract JSON object
            if '{' in json_text and '}' in json_text:
                start = json_text.find('{')
                end = json_text.rfind('}') + 1
                json_text = json_text[start:end]
            
            # Parse JSON
            result = json.loads(json_text)
            
            # Validate and fix required fields
            if 'label' not in result:
                # Try to infer from content
                text_lower = json_text.lower()
                if 'phishing' in text_lower:
                    result['label'] = 'phishing'
                elif 'safe' in text_lower or 'legitimate' in text_lower:
                    result['label'] = 'safe'
                else:
                    result['label'] = 'unclear'
            
            if 'confidence' not in result:
                result['confidence'] = 0.7 if result['label'] != 'unclear' else 0.5
            
            if 'reason_tags' not in result:
                result['reason_tags'] = ['analysis_completed']
            
            if 'explanation' not in result:
                result['explanation'] = 'Analysis completed'
            
            # Ensure label is valid
            if result['label'] not in ['phishing', 'safe', 'unclear']:
                result['label'] = 'unclear'
            
            # Ensure confidence is in range
            result['confidence'] = max(0.0, min(1.0, float(result['confidence'])))
            
            logger.info(f"Classification: {result['label']} (confidence: {result['confidence']})") 
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {e}")
            logger.error(f"Response text: {response_text if 'response_text' in locals() else 'N/A'}")
            # Return fallback result
            return {
                "label": "unclear",
                "confidence": 0.5,
                "reason_tags": ["json_parse_error"],
                "explanation": "Unable to parse classification result"
            }
        
        except Exception as e:
            logger.error(f"Error in classification: {e}")
            return {
                "label": "unclear",
                "confidence": 0.5,
                "reason_tags": ["error"],
                "explanation": f"Error analyzing message: {str(e)}"
            }
    
    def determine_category(self, reason_tags: List[str], message: str) -> str:
        """
        Determine the phishing category based on reason tags and message content.
        
        Args:
            reason_tags: List of reason tags
            message: Original message
            
        Returns:
            Category string
        """
        message_lower = message.lower()
        
        # Category keywords
        if any(word in message_lower for word in ['bank', 'account', 'credit card', 'payment']):
            return 'fake_bank'
        elif any(word in message_lower for word in ['package', 'delivery', 'shipping', 'fedex', 'ups', 'usps']):
            return 'fake_shipping'
        elif any(word in message_lower for word in ['password', 'verify', 'confirm', 'security alert', 'suspended']):
            return 'account_alert'
        elif any(word in message_lower for word in ['prize', 'winner', 'congratulations', 'lottery', 'million']):
            return 'prize_scam'
        elif any(word in message_lower for word in ['irs', 'tax', 'refund', 'government']):
            return 'tax_scam'
        elif 'impersonation' in reason_tags:
            return 'impersonation'
        else:
            return 'general_phishing'


# Global instance
classifier_agent = ClassifierAgent()
