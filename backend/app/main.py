from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import Database
from app.tools.dataset_tools import phishing_dataset
from agent import root_agent  # Import ADK root agent
import logging
from app.routers import metrics
from app.routers import eval as eval_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ThreatIQ API",
    description="Multi-Agent Phishing Trainer & Security Coach",
    version="1.0.0",
)

# ----------------- CORS CONFIG -----------------
# Add your frontend URLs here
origins = [
    "http://localhost:3000",
    "https://threat-iq-agent-b00ye3lnj-jay-patels-projects-9518309c.vercel.app/
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting ThreatIQ API...")

    # Connect to MongoDB
    await Database.connect_db()

    # Load phishing dataset
    phishing_dataset.load_dataset()

    logger.info("ThreatIQ API started successfully!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down ThreatIQ API...")
    await Database.close_db()
    logger.info("ThreatIQ API shut down successfully!")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to ThreatIQ API",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check database connection
        db = Database.get_db()
        await db.command("ping")

        return {
            "status": "healthy",
            "database": "connected",
            "dataset": "loaded" if phishing_dataset._loaded else "not loaded",
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


# Import and include routers
from app.routers import analysis, profile, auth

app.include_router(analysis.router, prefix="/api", tags=["Analysis"])
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(metrics.router, prefix="/api")
app.include_router(eval_router.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )
