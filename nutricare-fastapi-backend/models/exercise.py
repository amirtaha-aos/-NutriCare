from beanie import Document, Link
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from models.user import User


class IntensityLevel(str, Enum):
    LOW = "low"  # کم
    MODERATE = "moderate"  # متوسط
    HIGH = "high"  # زیاد
    VERY_HIGH = "very_high"  # خیلی زیاد


class ExerciseCategory(str, Enum):
    CARDIO = "cardio"  # کاردیو
    STRENGTH = "strength"  # قدرتی
    FLEXIBILITY = "flexibility"  # انعطاف‌پذیری
    BALANCE = "balance"  # تعادل
    SPORTS = "sports"  # ورزش‌های تیمی
    OTHER = "other"  # سایر


class Exercise(Document):
    """Exercise types database"""
    name: str = Field(index=True)
    name_en: str
    category: ExerciseCategory
    met_value: float  # Metabolic Equivalent of Task

    # Details
    description: Optional[str] = None
    benefits: List[str] = Field(default_factory=list)
    target_muscles: List[str] = Field(default_factory=list)

    # Recommendations
    recommended_for_gender: Optional[str] = None  # "male", "female", "both"
    recommended_for_goal: List[str] = Field(default_factory=list)  # ["weight_loss", "muscle_gain"]
    difficulty_level: str = "beginner"  # beginner, intermediate, advanced

    # Resources
    video_url: Optional[str] = None
    tutorial_url: Optional[str] = None
    image_url: Optional[str] = None

    class Settings:
        name = "exercises"
        indexes = ["name", "category"]


class ExerciseLog(Document):
    """User exercise log"""
    user: Link[User]
    exercise_type: str  # نام ورزش
    exercise_category: ExerciseCategory

    # Exercise details
    duration_minutes: int
    intensity: IntensityLevel
    met_value: float  # MET value for this exercise

    # Calculated values
    calories_burned: float
    distance: Optional[float] = None  # برای دویدن، شنا، دوچرخه (km)
    steps: Optional[int] = None  # برای پیاده‌روی
    weight_lifted: Optional[float] = None  # برای وزنه (kg)
    sets: Optional[int] = None
    reps: Optional[int] = None

    # Notes
    notes: Optional[str] = None

    # Samsung Health sync
    synced_from_samsung: bool = False
    samsung_exercise_id: Optional[str] = None

    # Timestamps
    performed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "exercise_logs"
        indexes = ["user", "performed_at", "exercise_type"]

    def calculate_calories_burned(self, user_weight_kg: float) -> float:
        """
        Calculate calories burned using MET formula
        Calories = MET × weight(kg) × duration(hours)
        """
        duration_hours = self.duration_minutes / 60

        # Adjust MET for intensity
        intensity_multipliers = {
            IntensityLevel.LOW: 0.8,
            IntensityLevel.MODERATE: 1.0,
            IntensityLevel.HIGH: 1.2,
            IntensityLevel.VERY_HIGH: 1.4,
        }
        adjusted_met = self.met_value * intensity_multipliers.get(self.intensity, 1.0)

        calories = adjusted_met * user_weight_kg * duration_hours
        self.calories_burned = round(calories, 2)
        return self.calories_burned
