from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database manager."""
    
    client: AsyncIOMotorClient = None
    db = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB."""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_uri)
            cls.db = cls.client[settings.mongodb_db_name]
            
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.mongodb_db_name}")
            
            await cls.create_indexes()
            
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection."""
        if cls.client:
            cls.client.close()
            logger.info("Closed MongoDB connection")
    
    @classmethod
    async def create_indexes(cls):
        """Create database indexes for performance."""
        try:
            await cls.db.user_profiles.create_index("user_id", unique=True)
            
            await cls.db.interactions.create_index([("user_id", 1), ("timestamp", -1)])
            
            await cls.db.users.create_index("firebase_uid", unique=True)
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
    
    @classmethod
    def get_db(cls):
        """Get database instance."""
        return cls.db


async def get_database():
    """Dependency to get database instance."""
    return Database.get_db()
