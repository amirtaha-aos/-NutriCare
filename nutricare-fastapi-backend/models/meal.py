from beanie import Document, Link
from pydantic import Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from models.user import User


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class FoodItem(Document):
    """Individual food item detected in image"""
    name: str
    estimated_amount: str  # "100g", "1 عدد", "نیم لیوان"
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: Optional[float] = 0
    confidence: float = Field(ge=0, le=1)  # 0-1

    # Detailed info
    description: Optional[str] = None
    cooking_method: Optional[str] = None
    oil_type: Optional[str] = None
    oil_amount: Optional[str] = None
    additives: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)


class Meal(Document):
    user: Link[User]
    meal_type: MealType
    name: str

    # Nutrition Info
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: Optional[float] = 0

    # Image Analysis
    image_url: Optional[str] = None
    ai_analyzed: bool = False
    detected_foods: List[Dict] = Field(default_factory=list)  # List of FoodItem dicts
    ai_recommendations: List[str] = Field(default_factory=list)

    # Portion tracking (before/after)
    before_image_url: Optional[str] = None
    after_image_url: Optional[str] = None
    consumed_percentage: Optional[float] = None  # 0-100

    # Custom notes
    notes: Optional[str] = None
    serving_size: Optional[str] = None

    # Timestamps
    consumed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "meals"
        indexes = ["user", "consumed_at", "meal_type"]

    def get_adjusted_nutrition(self) -> Dict[str, float]:
        """Get nutrition adjusted for consumed percentage"""
        if self.consumed_percentage:
            multiplier = self.consumed_percentage / 100
            return {
                "calories": round(self.calories * multiplier, 2),
                "protein": round(self.protein * multiplier, 2),
                "carbs": round(self.carbs * multiplier, 2),
                "fats": round(self.fats * multiplier, 2),
                "fiber": round(self.fiber * multiplier, 2) if self.fiber else 0,
            }
        return {
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats,
            "fiber": self.fiber,
        }
