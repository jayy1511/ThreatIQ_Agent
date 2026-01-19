"""
Analysis Router - Gateway endpoints that call Analysis Service

This router handles:
- /api/analyze (authenticated) - Full analysis with history
- /api/analyze-public (public) - Analysis without history
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.routers.auth import verify_firebase_token
from app.config import settings
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


async def call_analysis_service(message: str, user_guess: str = None, learning_context: dict = None) -> dict:
    """
    Call the analysis-service to get analysis results.
    
    Args:
        message: Message to analyze
        user_guess: Optional user prediction
        learning_context: Optional user learning context
        
    Returns:
        Analysis result from the service
    """
    payload = {
        "message": message,
        "user_guess": user_guess,
        "learning_context": learning_context
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.analysis_service_url}/analyze",
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Analysis service returned {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Analysis service error: {response.status_code}"
                )
            
            return response.json()
            
    except httpx.TimeoutException:
        logger.error("Analysis service timeout")
        raise HTTPException(status_code=504, detail="Analysis service timeout")
    except httpx.ConnectError:
        logger.error("Cannot connect to analysis service")
        raise HTTPException(status_code=503, detail="Analysis service unavailable")
    except Exception as e:
        logger.error(f"Error calling analysis service: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


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
        
        # Get learning context from memory agent
        from app.agents.memory import memory_agent
        learning_context = await memory_agent.get_learning_context(request.user_id)
        
        # Call analysis service
        result = await call_analysis_service(
            message=request.message,
            user_guess=request.user_guess,
            learning_context=learning_context
        )
        
        # Determine was_correct
        was_correct = None
        if request.user_guess:
            was_correct = request.user_guess.lower() == result['classification']['label'].lower()
        
        # Update profile and log interaction (gateway owns DB writes)
        from app.tools.profile_tools import InteractionLogger
        
        category = result.get('category', 'general_phishing')
        
        await memory_agent.update_profile(
            user_id=request.user_id,
            category=category,
            was_correct=was_correct
        )
        
        await InteractionLogger.log_interaction(
            user_id=request.user_id,
            message=request.message,
            user_guess=request.user_guess,
            classification=result['classification'],
            was_correct=was_correct,
            session_id=None,
            request_id=request.request_id
        )
        
        # Add session_id to result for response compatibility
        import uuid
        result['session_id'] = str(uuid.uuid4())
        result['was_correct'] = was_correct
        
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
        
        # Call analysis service without learning context
        result = await call_analysis_service(
            message=request.message,
            user_guess=request.user_guess,
            learning_context=None
        )
        
        # Add session_id for response compatibility
        import uuid
        result['session_id'] = str(uuid.uuid4())
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in public analysis endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
