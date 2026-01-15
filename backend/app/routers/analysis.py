from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import AnalysisRequest, AnalysisResponse
from agent import root_agent  # Use ADK root agent
from app.routers.auth import verify_firebase_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_message(
    request: AnalysisRequest,
    user_data: dict = Depends(verify_firebase_token)
):
    """
    Analyze a message for phishing using the multi-agent system.
    
    Args:
        request: AnalysisRequest with message and optional user_guess
        user_data: Verified user data from Firebase token
        
    Returns:
        Complete analysis response with classification and coaching
    """
    try:
        logger.info(f"Analysis request from user: {request.user_id}")
        
        if request.user_id != user_data.get('uid'):
            raise HTTPException(status_code=403, detail="User ID mismatch")
        
        result = await root_agent.analyze_message(
            message=request.message,
            user_id=request.user_id,
            user_guess=request.user_guess,
            request_id=request.request_id
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analysis endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-public")
async def analyze_message_public(request: AnalysisRequest):
    """
    Public analysis endpoint (no auth required) for testing.
    Limited functionality - doesn't save to user profile.
    """
    try:
        logger.info("Public analysis request (no auth)")
        
        result = await root_agent.analyze_message(
            message=request.message,
            user_id=request.user_id or "guest",
            user_guess=request.user_guess,
            request_id=request.request_id,
            save_interaction=False  # Public endpoint does NOT save to user history
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in public analysis endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
