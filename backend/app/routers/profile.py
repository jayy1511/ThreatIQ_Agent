from fastapi import APIRouter, HTTPException, Depends
from app.tools.profile_tools import ProfileManager
from app.routers.auth import verify_firebase_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/profile/{user_id}")
async def get_user_profile(
    user_id: str,
    user_data: dict = Depends(verify_firebase_token)
):
    """
    Get user profile and statistics.
    
    Args:
        user_id: Firebase UID
        user_data: Verified user data from token
        
    Returns:
        User profile with statistics
    """
    try:
        # Verify user can only access their own profile
        if user_id != user_data.get('uid'):
            raise HTTPException(status_code=403, detail="Cannot access other user's profile")
        
        profile = await ProfileManager.load_user_profile(user_id)
        summary = await ProfileManager.get_user_summary(user_id)
        
        return {
            "profile": profile.model_dump(),
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")


@router.get("/profile/{user_id}/summary")
async def get_profile_summary(
    user_id: str,
    user_data: dict = Depends(verify_firebase_token)
):
    """
    Get summary of user's learning progress.
    """
    try:
        if user_id != user_data.get('uid'):
            raise HTTPException(status_code=403, detail="Cannot access other user's data")
        
        summary = await ProfileManager.get_user_summary(user_id)
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")
