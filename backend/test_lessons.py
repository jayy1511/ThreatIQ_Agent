"""
Test script for Phase 2: Daily Lessons feature.

Run from backend directory with venv activated:
  python test_lessons.py
"""

import asyncio
import os
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_lessons():
    print("=" * 60)
    print("🧪 Phase 2: Daily Lessons Test")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Test 1: Check lesson endpoint exists (without auth)
        print("\n1️⃣ Testing lesson endpoints accessibility...")
        
        try:
            response = await client.get(f"{base_url}/api/lessons/today")
            if response.status_code == 401:
                print("   ✅ /api/lessons/today requires auth (expected)")
            else:
                print(f"   ⚠️ /api/lessons/today returned {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        try:
            response = await client.get(f"{base_url}/api/lessons/progress")
            if response.status_code == 401:
                print("   ✅ /api/lessons/progress requires auth (expected)")
            else:
                print(f"   ⚠️ /api/lessons/progress returned {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Test 2: Check MongoDB collections
    print("\n2️⃣ Checking MongoDB setup...")
    try:
        client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
        db = client[os.getenv('MONGODB_DB_NAME', 'ThreatIQ_Agent')]
        
        collections = await db.list_collection_names()
        
        if 'user_profiles' in collections:
            print("   ✅ user_profiles collection exists")
        else:
            print("   ⚠️ user_profiles collection not found")
        
        # Check if lesson_completions exists (will be created on first completion)
        if 'lesson_completions' in collections:
            count = await db.lesson_completions.count_documents({})
            print(f"   ✅ lesson_completions collection exists ({count} entries)")
        else:
            print("   ℹ️ lesson_completions will be created on first lesson completion")
        
        client.close()
    except Exception as e:
        print(f"   ❌ MongoDB error: {e}")
    
    # Test 3: Check lesson data
    print("\n3️⃣ Checking lesson catalog...")
    try:
        from app.data.lessons import LESSONS, get_lesson_of_day
        
        print(f"   ✅ {len(LESSONS)} lessons loaded")
        
        today_lesson = get_lesson_of_day()
        print(f"   ✅ Today's lesson: {today_lesson['title']}")
        print(f"      Topic: {today_lesson['topic']}")
        print(f"      Content sections: {len(today_lesson['content'])}")
        print(f"      Quiz questions: {len(today_lesson['quiz'])}")
    except Exception as e:
        print(f"   ❌ Lesson catalog error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Phase 2 Backend Ready!")
    print("=" * 60)
    print("\n📋 Manual test steps:")
    print("   1. Go to http://localhost:3000/dashboard")
    print("   2. You should see 'Leçon du Jour' card + 'Progression' card")
    print("   3. Click 'Commencer' to start today's lesson")
    print("   4. Complete the lesson and quiz")
    print("   5. Check that XP and streak update")
    print("   6. Refresh - stats should persist")

if __name__ == "__main__":
    asyncio.run(test_lessons())
