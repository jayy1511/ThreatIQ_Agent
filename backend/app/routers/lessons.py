"""
Lessons Router - Daily Micro-Lessons API

Endpoints:
- GET /api/lessons/today - Get today's lesson
- POST /api/lessons/complete - Complete a lesson and get XP
- GET /api/lessons/progress - Get user progress and streak
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import pytz
import logging

from app.routers.auth import verify_firebase_token
from app.models.database import Database
from app.data.lessons import get_lesson_of_day, get_lesson_by_id, get_all_lessons

router = APIRouter()
logger = logging.getLogger(__name__)

PARIS_TZ = pytz.timezone('Europe/Paris')


class LessonCompleteRequest(BaseModel):
    """Request to complete a lesson."""
    lesson_id: str
    answers: List[int]  # Selected option indices for each question


class LessonCompleteResponse(BaseModel):
    """Response after completing a lesson."""
    score_percent: int
    xp_earned: int
    xp_total: int
    level: int
    streak_current: int
    streak_best: int
    last_completed_date: str
    already_completed_today: bool
    message: str
    correct_answers: List[int]


class ProgressResponse(BaseModel):
    """User progress response."""
    xp_total: int
    level: int
    streak_current: int
    streak_best: int
    last_lesson_completed_date: Optional[str]
    last_7_days: List[dict]
    lessons_completed: int


def get_today_date_str() -> str:
    """Get today's date string in Europe/Paris timezone."""
    return datetime.now(PARIS_TZ).strftime('%Y-%m-%d')


def get_yesterday_date_str() -> str:
    """Get yesterday's date string in Europe/Paris timezone."""
    yesterday = datetime.now(PARIS_TZ) - timedelta(days=1)
    return yesterday.strftime('%Y-%m-%d')


def calculate_level(xp_total: int) -> int:
    """Calculate level from total XP."""
    return (xp_total // 100) + 1


def calculate_xp(score_percent: int) -> int:
    """Calculate XP earned from quiz score."""
    base = 10
    bonus = round(score_percent / 10)
    perfect_bonus = 5 if score_percent == 100 else 0
    return base + bonus + perfect_bonus


@router.get("/lessons/list")
async def get_lessons_list():
    """Get list of all available lessons (metadata only, no content)."""
    try:
        lessons = get_all_lessons()
        # Return only metadata for the list view
        return [
            {
                "lesson_id": lesson["lesson_id"],
                "title": lesson["title"],
                "topic": lesson["topic"]
            }
            for lesson in lessons
        ]
    except Exception as e:
        logger.error(f"Error getting lessons list: {e}")
        raise HTTPException(status_code=500, detail="Failed to get lessons list")


@router.get("/lessons/today")
async def get_today_lesson(user_data: dict = Depends(verify_firebase_token)):
    """Get today's lesson for the authenticated user."""
    try:
        lesson = get_lesson_of_day()
        user_id = user_data.get('uid')
        today = get_today_date_str()
        
        # Check if user already completed today's lesson
        db = Database.get_db()
        completion = await db.lesson_completions.find_one({
            "user_id": user_id,
            "date": today
        })
        
        already_completed = completion is not None
        
        return {
            "lesson": lesson,
            "date": today,
            "already_completed": already_completed,
            "completion_score": completion.get("score_percent") if completion else None
        }
        
    except Exception as e:
        logger.error(f"Error getting today's lesson: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get lesson")


@router.post("/lessons/complete", response_model=LessonCompleteResponse)
async def complete_lesson(
    request: LessonCompleteRequest,
    user_data: dict = Depends(verify_firebase_token)
):
    """Complete a lesson and award XP."""
    try:
        user_id = user_data.get('uid')
        today = get_today_date_str()
        yesterday = get_yesterday_date_str()
        
        db = Database.get_db()
        
        # Check if already completed today
        existing = await db.lesson_completions.find_one({
            "user_id": user_id,
            "date": today
        })
        
        if existing:
            # Already completed - return existing data without adding XP
            profile = await db.user_profiles.find_one({"user_id": user_id})
            return LessonCompleteResponse(
                score_percent=existing.get("score_percent", 0),
                xp_earned=0,
                xp_total=profile.get("xp_total", 0) if profile else 0,
                level=calculate_level(profile.get("xp_total", 0) if profile else 0),
                streak_current=profile.get("streak_current", 0) if profile else 0,
                streak_best=profile.get("streak_best", 0) if profile else 0,
                last_completed_date=today,
                already_completed_today=True,
                message="You already completed today's lesson!",
                correct_answers=existing.get("correct_answers", [])
            )
        
        # Validate lesson exists
        lesson = get_lesson_by_id(request.lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # Calculate score
        quiz = lesson.get("quiz", [])
        if len(request.answers) != len(quiz):
            raise HTTPException(status_code=400, detail="Invalid number of answers")
        
        correct_answers = [q["correct_index"] for q in quiz]
        correct_count = sum(1 for i, a in enumerate(request.answers) if a == correct_answers[i])
        score_percent = int((correct_count / len(quiz)) * 100) if quiz else 0
        
        # Calculate XP
        xp_earned = calculate_xp(score_percent)
        
        # Get or create user profile
        profile = await db.user_profiles.find_one({"user_id": user_id})
        if not profile:
            profile = {
                "user_id": user_id,
                "xp_total": 0,
                "streak_current": 0,
                "streak_best": 0,
                "last_lesson_completed_date": None,
                "total_messages": 0,
                "correct_guesses": 0,
                "by_category": {},
                "weak_spots": []
            }
        
        # Calculate streak
        last_completed = profile.get("last_lesson_completed_date")
        old_streak = profile.get("streak_current", 0)
        
        if last_completed == yesterday:
            new_streak = old_streak + 1
        elif last_completed == today:
            new_streak = old_streak  # Same day, no change
        else:
            new_streak = 1  # Reset streak
        
        new_streak_best = max(profile.get("streak_best", 0), new_streak)
        new_xp_total = profile.get("xp_total", 0) + xp_earned
        
        # Update profile
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "xp_total": new_xp_total,
                    "streak_current": new_streak,
                    "streak_best": new_streak_best,
                    "last_lesson_completed_date": today,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        # Log completion
        await db.lesson_completions.insert_one({
            "user_id": user_id,
            "date": today,
            "lesson_id": request.lesson_id,
            "score_percent": score_percent,
            "xp_earned": xp_earned,
            "answers": request.answers,
            "correct_answers": correct_answers,
            "created_at": datetime.utcnow()
        })
        
        # Create unique index if not exists
        try:
            await db.lesson_completions.create_index(
                [("user_id", 1), ("date", 1)],
                unique=True,
                name="unique_user_date"
            )
        except Exception:
            pass  # Index might already exist
        
        logger.info(f"User {user_id} completed lesson {request.lesson_id}: {score_percent}% -> +{xp_earned} XP")
        
        return LessonCompleteResponse(
            score_percent=score_percent,
            xp_earned=xp_earned,
            xp_total=new_xp_total,
            level=calculate_level(new_xp_total),
            streak_current=new_streak,
            streak_best=new_streak_best,
            last_completed_date=today,
            already_completed_today=False,
            message=f"Well done! +{xp_earned} XP earned!",
            correct_answers=correct_answers
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing lesson: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to complete lesson")


@router.get("/lessons/progress", response_model=ProgressResponse)
async def get_progress(user_data: dict = Depends(verify_firebase_token)):
    """Get user's lesson progress and streak."""
    try:
        user_id = user_data.get('uid')
        db = Database.get_db()
        
        # Get profile
        profile = await db.user_profiles.find_one({"user_id": user_id})
        
        xp_total = profile.get("xp_total", 0) if profile else 0
        streak_current = profile.get("streak_current", 0) if profile else 0
        streak_best = profile.get("streak_best", 0) if profile else 0
        last_completed = profile.get("last_lesson_completed_date") if profile else None
        
        # Check if streak should be reset (if last completion was before yesterday)
        today = get_today_date_str()
        yesterday = get_yesterday_date_str()
        
        if last_completed and last_completed != today and last_completed != yesterday:
            # Streak is broken but not yet reset in DB
            streak_current = 0
        
        # Get last 7 days
        last_7_days = []
        for i in range(6, -1, -1):
            day = datetime.now(PARIS_TZ) - timedelta(days=i)
            date_str = day.strftime('%Y-%m-%d')
            
            # Check if completed
            completion = await db.lesson_completions.find_one({
                "user_id": user_id,
                "date": date_str
            })
            
            last_7_days.append({
                "date": date_str,
                "day_name": day.strftime('%a'),
                "completed": completion is not None
            })
        
        # Count total completions
        lessons_completed = await db.lesson_completions.count_documents({"user_id": user_id})
        
        return ProgressResponse(
            xp_total=xp_total,
            level=calculate_level(xp_total),
            streak_current=streak_current,
            streak_best=streak_best,
            last_lesson_completed_date=last_completed,
            last_7_days=last_7_days,
            lessons_completed=lessons_completed
        )
        
    except Exception as e:
        logger.error(f"Error getting progress: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get progress")


@router.get("/lessons/recent")
async def get_recent_completions(
    limit: int = 5,
    user_data: dict = Depends(verify_firebase_token)
):
    """Get user's recent lesson completions."""
    try:
        user_id = user_data.get('uid')
        db = Database.get_db()
        
        # Fetch recent completions
        cursor = db.lesson_completions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)
        
        recent = []
        async for completion in cursor:
            # Get lesson details
            lesson = get_lesson_by_id(completion.get("lesson_id"))
            
            recent.append({
                "lesson_id": completion.get("lesson_id"),
                "date": completion.get("date"),
                "score_percent": completion.get("score_percent"),
                "xp_earned": completion.get("xp_earned"),
                "lesson_title": lesson.get("title") if lesson else "Unknown Lesson",
                "lesson_topic": lesson.get("topic") if lesson else "unknown"
            })
        
        return {"recent_completions": recent}
        
    except Exception as e:
        logger.error(f"Error getting recent completions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get recent completions")


@router.get("/lessons")
async def list_lessons(user_data: dict = Depends(verify_firebase_token)):
    """Get list of all available lessons."""
    try:
        return {"lessons": get_all_lessons()}
    except Exception as e:
        logger.error(f"Error listing lessons: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list lessons")
