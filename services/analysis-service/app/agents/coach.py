"""
Coach Agent - Generates personalized coaching responses
"""

from typing import Dict, List
import logging
import json

from app.llm.gemini_client import get_gemini_client

logger = logging.getLogger(__name__)


class CoachAgent:
    """Coach Agent - Generates personalized coaching, tips, and quizzes."""
    
    def __init__(self):
        self.gemini_client = get_gemini_client()
    
    async def generate_coaching(
        self,
        message: str,
        classification: Dict,
        similar_examples: List[Dict],
        learning_context: Dict
    ) -> Dict:
        """Generate personalized coaching response."""
        try:
            prompt = self._build_coaching_prompt(
                message, classification, similar_examples, learning_context
            )
            
            response_text = await self.gemini_client.generate(
                prompt=prompt,
                system_instruction="",
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "top_k": 40,
                },
                use_cache=False
            )
            
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            result = json.loads(response_text)
            result['similar_examples'] = similar_examples
            
            if 'verdict' not in result:
                result['verdict'] = classification['label']
            if 'explanation' not in result:
                result['explanation'] = classification.get('explanation', 'Analysis complete')
            if 'tips' not in result:
                result['tips'] = self._get_default_tips(classification['label'])
            
            logger.info(f"Generated coaching response for {result['verdict']} verdict")
            return result
            
        except Exception as e:
            logger.error(f"Error generating coaching: {e}")
            return self._get_fallback_response(classification, similar_examples)
    
    def _build_coaching_prompt(
        self,
        message: str,
        classification: Dict,
        similar_examples: List[Dict],
        learning_context: Dict
    ) -> str:
        """Build the coaching prompt based on context."""
        
        user_level = "beginner" if learning_context.get('is_new_user', True) else "intermediate"
        weak_spots = learning_context.get('weak_spots', [])
        
        weak_spots_text = ""
        if weak_spots:
            weak_spots_text = f"\nThe user has struggled with: {', '.join(weak_spots)}."
        
        examples_text = ""
        if similar_examples:
            examples_text = "\n\nSIMILAR PHISHING EXAMPLES:\n"
            for i, ex in enumerate(similar_examples[:2], 1):
                examples_text += f"{i}. Category: {ex['category']}\n   Example: {ex['message'][:100]}...\n"
        
        prompt = f"""You are a security awareness coach. Help the user understand this message analysis.

MESSAGE ANALYZED:
{message}

CLASSIFICATION RESULT:
- Verdict: {classification['label']}
- Confidence: {classification['confidence']}
- Red Flags: {', '.join(classification['reason_tags'])}
- Reasoning: {classification['explanation']}

USER CONTEXT:
- Experience Level: {user_level}
- Total Messages Analyzed: {learning_context.get('total_messages', 0)}
- Current Accuracy: {learning_context.get('accuracy', 0):.1f}%{weak_spots_text}{examples_text}

Generate a coaching response as JSON with this EXACT structure:
{{
    "verdict": "{classification['label']}",
    "explanation": "Detailed, educational explanation. Do NOT use markdown formatting - use plain text only.",
    "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
    "quiz": {{
        "question": "Test question about this specific message",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option X (must match one of the options exactly)"
    }}
}}

Generate the JSON response now:"""
        
        return prompt
    
    def _get_default_tips(self, label: str) -> List[str]:
        """Get default tips based on label."""
        tips_map = {
            'phishing': [
                "Always verify the sender's email address carefully",
                "Hover over links before clicking to see the real URL",
                "Be suspicious of urgent language or threats"
            ],
            'safe': [
                "Continue being cautious with unexpected messages",
                "Always verify sender identity when in doubt",
                "Keep your security awareness skills sharp"
            ],
            'unclear': [
                "When in doubt, verify through official channels",
                "Don't click links in suspicious messages",
                "Contact the company directly using their official website"
            ]
        }
        return tips_map.get(label, tips_map['unclear'])
    
    def _get_fallback_response(self, classification: Dict, similar_examples: List[Dict]) -> Dict:
        """Get fallback response if AI generation fails."""
        return {
            "verdict": classification['label'],
            "explanation": classification.get('explanation', 'This message has been analyzed.'),
            "similar_examples": similar_examples,
            "tips": self._get_default_tips(classification['label']),
            "quiz": None
        }


coach_agent = CoachAgent()
