from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from config.settings import settings
from models.user import User
from models.meal import Meal
from models.health_log import HealthLog
from models.medication import Medication
from models.exercise import Exercise, ExerciseLog
from models.chat_history import ChatHistory
from models.meal_plan import MealPlan


class Database:
    client: AsyncIOMotorClient = None
    db = None


db = Database()


async def connect_to_mongo():
    """Connect to MongoDB and initialize Beanie ODM"""
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.DB_NAME]

    # Initialize Beanie with all document models
    await init_beanie(
        database=db.db,
        document_models=[
            User,
            Meal,
            HealthLog,
            Medication,
            Exercise,
            ExerciseLog,
            ChatHistory,
            MealPlan,
        ],
    )
    print("✅ MongoDB connected and Beanie initialized")


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("❌ MongoDB connection closed")


def get_database():
    """Dependency to get database instance"""
    return db.db
