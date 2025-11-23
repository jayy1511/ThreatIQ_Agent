from fastapi import APIRouter, HTTPException, Depends
from app.tools.profile_tools import ProfileManager
from app.routers.auth import verify_firebase_token
from app.models.database import Database
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/profile/{user_id}")
async def get_user_profile(
    user_id: str,
    user_data: dict = Depends(verify_firebase_token),
):
    """
    Get user profile and statistics (full object).
    Returns:
      {
        "profile": UserProfile,
        "summary": {...}
      }
    """
    try:
        # User can only access their own profile
        if user_id != user_data.get("uid"):
            raise HTTPException(
                status_code=403,
                detail="Cannot access other user's profile",
            )

        profile = await ProfileManager.load_user_profile(user_id)
        summary = await ProfileManager.get_user_summary(user_id)

        return {
            "profile": profile.model_dump(),
            "summary": summary,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get profile: {str(e)}",
        )


@router.get("/profile/{user_id}/summary")
async def get_profile_summary(
    user_id: str,
    user_data: dict = Depends(verify_firebase_token),
):
    """
    Get summary of user's learning progress.
    """
    try:
        if user_id != user_data.get("uid"):
            raise HTTPException(
                status_code=403,
                detail="Cannot access other user's data",
            )

        summary = await ProfileManager.get_user_summary(user_id)
        return summary

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile summary: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get summary: {str(e)}",
        )


@router.get("/profile/{user_id}/history")
async def get_user_history(
    user_id: str,
    user_data: dict = Depends(verify_firebase_token),
):
    """
    Get recent interaction history for the user (most recent first).
    """
    try:
        if user_id != user_data.get("uid"):
            raise HTTPException(
                status_code=403,
                detail="Cannot access other user's data",
            )

        db = Database.get_db()
        cursor = (
            db.interactions.find({"user_id": user_id})
            .sort("timestamp", -1)
            .limit(50)
        )

        history = []
        async for doc in cursor:
            ts = doc.get("timestamp")
            if isinstance(ts, datetime):
                ts_val = ts.isoformat()
            else:
                ts_val = str(ts) if ts is not None else None

            history.append(
                {
                    "id": str(doc.get("_id")),
                    "message": doc.get("message", ""),
                    "classification": doc.get("classification", {}),
                    "was_correct": doc.get("was_correct"),
                    "session_id": doc.get("session_id"),
                    "timestamp": ts_val,
                }
            )

        return {"history": history}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting history: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get history: {str(e)}",
        )
