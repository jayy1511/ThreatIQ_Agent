import logging
import json
from typing import Dict, List

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini API once
genai.configure(api_key=settings.gemini_api_key)


class ClassifierAgent:
    """
    Classifier Agent - Analyzes messages and produces structured classification.
    """

    def __init__(self) -> None:
        # System instruction that defines the JSON schema and behaviour
        self.system_instruction = """
You are a phishing detection expert. Your task is to analyse messages and decide
whether they are "phishing", "safe", or "unclear".

Return your analysis as a JSON object with this EXACT structure:

{
  "label": "phishing" | "safe" | "unclear",
  "confidence": 0.0-1.0,
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

Be precise and conservative. If there is no concrete sign of phishing, use "safe".
"""

        # Attach the system instruction to the model so it always sees the schema
        self.model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=self.system_instruction,
        )

    async def classify(self, message: str) -> Dict:
        """
        Classify a message as phishing, safe, or unclear.

        Returns a dict with: label, confidence, reason_tags, explanation.
        """
        try:
            prompt = f"""
Analyze the following message and decide if it is "phishing", "safe", or "unclear".
Respond ONLY with a single JSON object with the keys:
  "label", "confidence", "reason_tags", "explanation".

MESSAGE:
{message}
"""

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    top_p=0.8,
                    top_k=40,
                    response_mime_type="application/json",
                ),
            )

            # Get response text and log a snippet for debugging
            response_text = response.text.strip()
            logger.info("Raw Gemini response: %s...", response_text[:200])

            # Try to extract JSON robustly
            json_text = response_text

            # Strategy 1: strip markdown code fences
            if "```" in json_text:
                parts = json_text.split("```")
                for part in parts:
                    candidate = part.strip()
                    if candidate.startswith("json"):
                        json_text = candidate[4:].strip()
                        break
                    if "{" in candidate and "}" in candidate:
                        json_text = candidate
                        break

            # Strategy 2: take inner-most JSON object
            if "{" in json_text and "}" in json_text:
                start = json_text.find("{")
                end = json_text.rfind("}") + 1
                json_text = json_text[start:end]

            result = json.loads(json_text)

            # --- Fallback / healing logic ---------------------------------
            text_lower = json_text.lower()

            # If label missing, infer from text heuristically
            if "label" not in result or not result.get("label"):
                if "not phishing" in text_lower or "appears safe" in text_lower or "looks safe" in text_lower:
                    result["label"] = "safe"
                elif "safe" in text_lower or "legitimate" in text_lower:
                    result["label"] = "safe"
                elif "phishing" in text_lower or "scam" in text_lower:
                    result["label"] = "phishing"
                else:
                    result["label"] = "unclear"

            # Normalise label
            if result["label"] not in ["phishing", "safe", "unclear"]:
                result["label"] = "unclear"

            # If confidence missing, provide a sane default
            if "confidence" not in result or result["confidence"] is None:
                result["confidence"] = 0.7 if result["label"] != "unclear" else 0.5

            # Ensure reason_tags exists
            if "reason_tags" not in result or not isinstance(result["reason_tags"], list):
                result["reason_tags"] = ["analysis_completed"]

            # Ensure explanation exists
            if "explanation" not in result or not result["explanation"]:
                result["explanation"] = "Analysis completed."

            # Clamp confidence
            try:
                result["confidence"] = max(0.0, min(1.0, float(result["confidence"])))
            except Exception:
                result["confidence"] = 0.7 if result["label"] != "unclear" else 0.5

            logger.info("Classification: %s (confidence: %.2f)", result["label"], result["confidence"])
            return result

        except json.JSONDecodeError as e:
            logger.error("Error parsing JSON response: %s", e, exc_info=True)
            logger.error("Response text was: %s", locals().get("response_text", "N/A"))
            return {
                "label": "unclear",
                "confidence": 0.5,
                "reason_tags": ["json_parse_error"],
                "explanation": "Unable to parse classification result.",
            }

        except Exception as e:
            logger.error("Error in classification: %s", e, exc_info=True)
            return {
                "label": "unclear",
                "confidence": 0.5,
                "reason_tags": ["error"],
                "explanation": f"Error analysing message: {e}",
            }

    def determine_category(self, reason_tags: List[str], message: str) -> str:
        """
        Determine a phishing category based on reason_tags and message content.
        """
        message_lower = message.lower()

        if any(word in message_lower for word in ["bank", "account", "credit card", "payment"]):
            return "fake_bank"
        elif any(word in message_lower for word in ["package", "delivery", "shipping", "fedex", "ups", "usps"]):
            return "fake_shipping"
        elif any(word in message_lower for word in ["password", "verify", "confirm", "security alert", "suspended"]):
            return "account_alert"
        elif any(word in message_lower for word in ["prize", "winner", "congratulations", "lottery", "million"]):
            return "prize_scam"
        elif any(word in message_lower for word in ["irs", "tax", "refund", "government"]):
            return "tax_scam"
        elif "impersonation" in reason_tags:
            return "impersonation"
        else:
            return "general_phishing"


# Global instance used by the root agent
classifier_agent = ClassifierAgent()
