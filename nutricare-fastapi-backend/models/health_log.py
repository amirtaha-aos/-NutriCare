from beanie import Document, Link
from pydantic import Field
from typing import Optional, Dict
from datetime import datetime, date
from models.user import User


class HealthLog(Document):
    """Daily health tracking"""
    user: Link[User]
    date: date = Field(default_factory=date.today, index=True)

    # Weight tracking
    weight: Optional[float] = None  # kg
    body_fat_percentage: Optional[float] = None

    # Water intake
    water_intake_ml: int = 0
    water_goal_ml: int = 2000

    # Sleep
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)  # 1-5 rating

    # Steps (can sync from Samsung Health)
    steps: int = 0
    steps_goal: int = 10000

    # Blood Pressure
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None

    # Blood Sugar
    blood_sugar: Optional[float] = None  # mg/dL

    # Mood
    mood: Optional[str] = None  # "عالی", "خوب", "متوسط", "بد"
    energy_level: Optional[int] = Field(None, ge=1, le=5)

    # Notes
    notes: Optional[str] = None

    # Lab tests (if uploaded)
    lab_test_results: Optional[Dict] = None
    lab_test_image_url: Optional[str] = None
    lab_test_ai_analysis: Optional[str] = None

    # Samsung Health sync
    synced_from_samsung: bool = False
    last_samsung_sync: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "health_logs"
        indexes = ["user", "date"]
        unique_together = [("user", "date")]  # One log per user per day
