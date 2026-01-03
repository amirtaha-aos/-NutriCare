from beanie import Document, Link
from pydantic import Field
from typing import Optional, List, Dict
from datetime import datetime, date
from models.user import User


class DailyMealPlan(Document):
    """Single day meal plan"""
    breakfast: Dict
    lunch: Dict
    dinner: Dict
    snacks: List[Dict] = Field(default_factory=list)

    # Daily totals
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    total_cost: float


class MealPlan(Document):
    """Weekly/monthly meal plan"""
    user: Link[User]
    title: str = "برنامه غذایی شخصی"

    # Duration
    start_date: date
    end_date: date
    duration_days: int

    # User preferences
    budget: float  # تومان
    currency: str = "تومان"
    location_city: str
    location_country: str = "ایران"

    # Available items at home
    available_items: List[str] = Field(default_factory=list)

    # Dietary info
    dietary_restrictions: List[str] = Field(default_factory=list)
    diseases: List[str] = Field(default_factory=list)

    # Daily plan
    daily_plans: List[Dict] = Field(default_factory=list)  # List of DailyMealPlan dicts

    # Shopping list
    shopping_list: Dict = Field(default_factory=dict)
    total_budget_used: float = 0

    # Nutritional targets
    daily_calorie_target: float
    daily_protein_target: float
    daily_carbs_target: float
    daily_fats_target: float

    # AI generated
    ai_generated: bool = True
    ai_recommendations: List[str] = Field(default_factory=list)

    # PDF export
    pdf_url: Optional[str] = None
    pdf_generated_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "meal_plans"
        indexes = ["user", "start_date", "created_at"]
