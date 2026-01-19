"""
Analysis Service - FastAPI Application

Stateless AI analysis microservice for ThreatIQ.
Handles message classification, evidence finding, and coaching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.schemas import AnalysisRequest, AnalysisResponse
from app.orchestrator import run_analysis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ThreatIQ Analysis Service",
    description="Stateless AI analysis microservice for phishing detection",
    version="1.0.0"
)

# CORS middleware (allow gateway to call this service)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service, gateway handles real CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "ThreatIQ Analysis Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_message(request: AnalysisRequest):
    """
    Analyze a message for phishing indicators.
    
    This endpoint runs the complete analysis pipeline:
    1. Classifier Agent - Determines if message is phishing/safe/unclear
    2. Evidence Agent - Finds similar phishing examples
    3. Coach Agent - Generates educational coaching response
    
    Args:
        request: AnalysisRequest with message, optional user_guess and learning_context
        
    Returns:
        Complete analysis with classification, coaching, and evidence
    """
    try:
        logger.info(f"Received analysis request: {len(request.message)} chars")
        
        result = await run_analysis(request)
        
        return result
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Initialize components on startup."""
    logger.info("Analysis Service starting up...")
    
    # Pre-load dataset
    from app.tools.dataset_tools import load_phishing_dataset
    result = load_phishing_dataset()
    logger.info(f"Dataset status: {result}")
    
    logger.info("Analysis Service ready!")
