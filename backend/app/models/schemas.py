from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class AnalysisRequest(BaseModel):
    """Request model for phishing analysis."""
    message: str = Field(..., min_length=1, description="Email or message to analyze")
    user_guess: Optional[str] = Field(None, description="User's prediction: phishing, safe, or unclear")
    user_id: str = Field(..., description="Firebase UID")


class ClassificationResult(BaseModel):
    """Classification result from Classifier Agent."""
    label: str = Field(..., description="phishing, safe, or unclear")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    reason_tags: List[str] = Field(default_factory=list, description="List of reason tags")
    explanation: str = Field(..., description="Brief explanation")


class PhishingExample(BaseModel):
    """Similar phishing example from dataset."""
    message: str
    category: str
    description: str


class QuizQuestion(BaseModel):
    """Quiz question from Coach Agent."""
    question: str
    options: List[str]
    correct_answer: str


class CoachResponse(BaseModel):
    """Response from Coach Agent."""
    verdict: str
    explanation: str
    similar_examples: List[PhishingExample]
    tips: List[str]
    quiz: Optional[QuizQuestion] = None


class AnalysisResponse(BaseModel):
    """Complete analysis response."""
    classification: ClassificationResult
    coach_response: CoachResponse
    was_correct: Optional[bool] = None
    session_id: str


class UserProfile(BaseModel):
    """User profile model."""
    user_id: str
    total_messages: int = 0
    correct_guesses: int = 0
    by_category: Dict[str, Dict[str, int]] = Field(default_factory=dict)
    weak_spots: List[str] = Field(default_factory=list)
    last_seen: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class InteractionLog(BaseModel):
    """Interaction log model."""
    user_id: str
    message: str
    user_guess: Optional[str]
    classification: ClassificationResult
    was_correct: Optional[bool]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: str
