"""
Test script to verify double history fix.

Run from backend directory with venv activated:
  python test_double_history_fix.py
"""

import asyncio
import os
import httpx
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def test_fix():
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DB_NAME', 'ThreatIQ_Agent')]
    
    print("=" * 60)
    print("🧪 Double History Fix Verification")
    print("=" * 60)
    
    # Get initial count
    initial_count = await db.interactions.count_documents({})
    print(f"\n1️⃣ Initial history count: {initial_count}")
    
    # Test /api/analyze-public does NOT create history
    print("\n2️⃣ Testing /api/analyze-public (should NOT create history)...")
    test_message = f"TEST PUBLIC - Should not save - {os.urandom(4).hex()}"
    
    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            "http://localhost:8000/api/analyze-public",
            json={
                "message": test_message,
                "user_id": "test_user",
                "user_guess": "unclear",
                "request_id": f"test-public-{os.urandom(4).hex()}"
            },
            timeout=60.0
        )
    
    if response.status_code == 200:
        print(f"   ✅ /api/analyze-public returned 200")
    else:
        print(f"   ⚠️ /api/analyze-public returned {response.status_code}")
        print(f"   Response: {response.text[:200]}")
    
    # Check if history increased
    count_after_public = await db.interactions.count_documents({})
    public_entries = await db.interactions.count_documents({"message": test_message})
    
    if public_entries == 0:
        print(f"   ✅ No history entry created (count still {count_after_public})")
    else:
        print(f"   ❌ FAIL: Public endpoint created {public_entries} entry(ies)!")
    
    print("\n3️⃣ Summary:")
    print(f"   - /api/analyze-public saves to history: {'NO ✅' if public_entries == 0 else 'YES ❌'}")
    print(f"   - Response validation: {'PASSED ✅' if response.status_code == 200 else 'FAILED ❌'}")
    
    if public_entries == 0 and response.status_code == 200:
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n📋 Manual test remaining:")
        print("   1. Go to http://localhost:3000/analyze")
        print("   2. Analyze a message")
        print("   3. Check /history - should have exactly ONE new entry")
    else:
        print("\n❌ Some tests failed - check output above")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_fix())
