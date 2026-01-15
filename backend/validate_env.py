"""
Environment Configuration Validator

Run this script to validate your .env configuration before starting the server.
"""

import os
from dotenv import load_dotenv
import sys

def validate_env():
    """Validate all required environment variables."""
    
    print("🔍 Validating environment configuration...\n")
    
    # Load .env file
    load_dotenv()
    
    required_vars = {
        'GEMINI_API_KEY': 'Gemini API Key',
        'MONGODB_URI': 'MongoDB Connection String',
        'MONGODB_DB_NAME': 'MongoDB Database Name',
        'FIREBASE_PROJECT_ID': 'Firebase Project ID',
        'FIREBASE_PRIVATE_KEY': 'Firebase Private Key',
        'FIREBASE_CLIENT_EMAIL': 'Firebase Client Email',
        'CORS_ORIGINS': 'CORS Origins',
    }
    
    optional_vars = {
        'API_HOST': 'API Host',
        'API_PORT': 'API Port',
        'ENVIRONMENT': 'Environment',
    }
    
    all_valid = True
    
    # Check required variables
    print("✅ Required Variables:")
    print("-" * 60)
    
    for var, description in required_vars.items():
        value = os.getenv(var)
        
        if not value:
            print(f"❌ {description:30} MISSING")
            all_valid = False
        elif value.startswith('your_') or 'example' in value.lower():
            print(f"⚠️  {description:30} NOT CONFIGURED (placeholder value)")
            all_valid = False
        else:
            # Mask sensitive values
            if 'key' in var.lower() or 'private' in var.lower():
                masked = value[:20] + '...' if len(value) > 20 else value
                print(f"✅ {description:30} {masked}")
            else:
                print(f"✅ {description:30} {value}")
    
    print("\n📝 Optional Variables:")
    print("-" * 60)
    
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print(f"✅ {description:30} {value}")
        else:
            print(f"⚠️  {description:30} Using default")
    
    print("\n" + "=" * 60)
    
    if all_valid:
        print("✅ Environment configuration is valid!")
        print("\n🚀 You can now run: uvicorn app.main:app --reload")
        return True
    else:
        print("❌ Environment configuration has issues!")
        print("\n📖 Please check backend/SETUP_GUIDE.md for instructions")
        return False

def test_mongodb_connection():
    """Test MongoDB connection."""
    print("\n" + "=" * 60)
    print("🔌 Testing MongoDB Connection...")
    print("=" * 60)
    
    try:
        from pymongo import MongoClient
        import os
        
        uri = os.getenv('MONGODB_URI')
        if not uri:
            print("❌ MONGODB_URI not set")
            return False
        
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        
        print("✅ MongoDB connection successful!")
        
        # List databases
        dbs = client.list_database_names()
        print(f"📦 Available databases: {', '.join(dbs[:5])}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   - Check your MongoDB URI is correct")
        print("   - Ensure your IP is whitelisted in MongoDB Atlas")
        print("   - Verify your database password is correct")
        return False

def test_gemini_api():
    """Test Gemini API connection."""
   
    print("\n" + "=" * 60)
    print("🤖 Testing Gemini API Connection...")
    print("=" * 60)
    
    try:
        import asyncio
        from app.llm.gemini_client import get_gemini_client
        from app.config import settings
        
        if not settings.gemini_keys_list:
            print("❌ No Gemini API keys configured")
            print("   Set GEMINI_API_KEYS or GEMINI_API_KEY in .env")
            return False
        
        print(f"✓ Found {len(settings.gemini_keys_list)} API key(s)")
        
        # Test generation
        client = get_gemini_client()
        
        async def test_generation():
            return await client.generate(
                prompt="Say 'test successful' in one word",
                system_instruction="You are a helpful assistant",
                generation_config={"temperature": 0.1},
                use_cache=False
            )
        
        response = asyncio.run(test_generation())
        print("✅ Gemini API connection successful!")
        print(f"   Response: {response[:50]}...")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   - Verify your Gemini API key is correct")
        print("   - Check you have access to free-tier models")
        print("   - Ensure you haven't exceeded quota limits")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 ThreatIQ Backend - Environment Validation")
    print("=" * 60 + "\n")
    
    # Validate environment variables
    env_valid = validate_env()
    
    if not env_valid:
        sys.exit(1)
    
    # Test connections
    mongodb_ok = test_mongodb_connection()
    gemini_ok = test_gemini_api()
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    print("=" * 60)
    print(f"Environment Config:  {'✅' if env_valid else '❌'}")
    print(f"MongoDB Connection:  {'✅' if mongodb_ok else '❌'}")
    print(f"Gemini API:          {'✅' if gemini_ok else '❌'}")
    print("=" * 60)
    
    if env_valid and mongodb_ok and gemini_ok:
        print("\n🎉 All systems ready! You can start the server now.")
        sys.exit(0)
    else:
        print("\n⚠️  Please fix the issues above before starting the server.")
        sys.exit(1)
