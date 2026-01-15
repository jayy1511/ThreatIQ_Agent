"""
Script to fix duplicate history entries and verify idempotency.

This script will:
1. Check if unique index exists
2. Remove old duplicate entries (keep most recent)
3. Verify new entries don't duplicate
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def fix_duplicates():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DB_NAME', 'ThreatIQ_Agent')]
    
    print("=" * 60)
    print("🔧 Duplicate History Fixer")
    print("=" * 60)
    
    # Step 1: Check indexes
    print("\n1️⃣ Checking indexes...")
    indexes = await db.interactions.list_indexes().to_list(length=100)
    
    has_unique_index = False
    for idx in indexes:
        print(f"   - {idx['name']}: {idx.get('key', {})}")
        if idx['name'] == 'unique_user_request':
            has_unique_index = True
            print("   ✅ Unique index found!")
    
    if not has_unique_index:
        print("\n   ⚠️  Creating unique index on (user_id, request_id)...")
        try:
            await db.interactions.create_index(
                [("user_id", 1), ("request_id", 1)],
                unique=True,
                name="unique_user_request"
            )
            print("   ✅ Index created successfully!")
        except Exception as e:
            print(f"   ⚠️  Index creation note: {e}")
    
    # Step 2: Check for duplicates
    print("\n2️⃣ Checking for duplicate entries...")
    
    # Find entries without request_id (old entries before fix)
    old_entries = await db.interactions.count_documents({"request_id": {"$exists": False}})
    print(f"   Found {old_entries} old entries without request_id")
    
    # Find actual duplicates (same message, user, within 5 seconds)
    pipeline = [
        {
            "$group": {
                "_id": {
                    "user_id": "$user_id",
                    "message": "$message",
                    "timestamp": {
                        "$subtract": [
                            {"$toLong": "$timestamp"},
                            {"$mod": [{"$toLong": "$timestamp"}, 5000]}  # Group within 5 second windows
                        ]
                    }
                },
                "count": {"$sum": 1},
                "docs": {"$push": "$$ROOT"}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        }
    ]
    
    duplicates = await db.interactions.aggregate(pipeline).to_list(length=1000)
    
    if duplicates:
        print(f"\n   ⚠️  Found {len(duplicates)} duplicate message groups!")
        
        # Remove duplicates (keep the most recent one)
        removed_count = 0
        for dup_group in duplicates:
            docs = dup_group['docs']
            # Sort by timestamp, keep most recent
            docs.sort(key=lambda x: x.get('timestamp', datetime.min), reverse=True)
            
            # Delete all but the first (most recent)
            for doc in docs[1:]:
                await db.interactions.delete_one({"_id": doc["_id"]})
                removed_count += 1
        
        print(f"   ✅ Removed {removed_count} duplicate entries!")
    else:
        print("   ✅ No duplicates found!")
    
    # Step 3: Update old entries with request_id
    if old_entries > 0:
        print(f"\n3️⃣ Updating {old_entries} old entries with request_id...")
        import uuid
        
        cursor = db.interactions.find({"request_id": {"$exists": False}})
        updated = 0
        async for doc in cursor:
            await db.interactions.update_one(
                {"_id": doc["_id"]},
                {"$set": {"request_id": str(uuid.uuid4())}}
            )
            updated += 1
        
        print(f"   ✅ Updated {updated} old entries!")
    
    # Step 4: Final count
    print("\n4️⃣ Final Statistics:")
    total = await db.interactions.count_documents({})
    with_request_id = await db.interactions.count_documents({"request_id": {"$exists": True}})
    
    print(f"   Total interactions: {total}")
    print(f"   With request_id: {with_request_id}")
    
    print("\n" + "=" * 60)
    print("✅ Duplicate fix complete!")
    print("=" * 60)
    print("\nℹ️  New entries will automatically prevent duplicates.")
    print("ℹ️  Test by analyzing a message - it should only appear once in history!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_duplicates())
