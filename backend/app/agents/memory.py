from app.tools.profile_tools import ProfileManager
from app.models.schemas import UserProfile
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class MemoryAgent:
    """
    Memory Agent - Manages user profiles and learning history.
    """
    
    async def load_profile(self, user_id: str) -> UserProfile:
        """
        Load user profile.
        
        Args:
            user_id: Firebase UID
            
        Returns:
            UserProfile object
        """
        return await ProfileManager.load_user_profile(user_id)
    
    async def update_profile(
        self,
        user_id: str,
        category: str,
        was_correct: Optional[bool]
    ) -> UserProfile:
        """
        Update user profile after interaction.
        
        Args:
            user_id: Firebase UID
            category: Phishing category
            was_correct: Whether user's guess was correct
            
        Returns:
            Updated UserProfile
        """
        return await ProfileManager.update_profile_stats(
            user_id=user_id,
            category=category,
            was_correct=was_correct
        )
    
    async def get_learning_context(self, user_id: str) -> Dict:
        """
        Get learning context for coaching personalization.
        
        Args:
            user_id: Firebase UID
            
        Returns:
            Dictionary with learning context
        """
        try:
            profile = await self.load_profile(user_id)
            
            # Build context summary
            context = {
                "is_new_user": profile.total_messages < 5,
                "weak_spots": profile.weak_spots[:3] if profile.weak_spots else [],
                "accuracy": 0.0
            }
            
            if profile.total_messages > 0:
                context["accuracy"] = (profile.correct_guesses / profile.total_messages) * 100
            
            # Add struggle categories
            struggling_with = []
            for category, stats in profile.by_category.items():
                if stats["seen"] >= 2:
                    mistake_rate = stats["mistakes"] / stats["seen"]
                    if mistake_rate > 0.4:  # 40% mistake rate
                        struggling_with.append({
                            "category": category,
                            "mistake_rate": round(mistake_rate * 100, 1)
                        })
            
            context["struggling_with"] = struggling_with
            
            return context
            
        except Exception as e:
            logger.error(f"Error getting learning context: {e}")
            return {
                "is_new_user": True,
                "weak_spots": [],
                "accuracy": 0.0,
                "struggling_with": []
            }


# Global instance
memory_agent = MemoryAgent()
