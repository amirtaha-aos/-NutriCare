from beanie import Document, Link
from pydantic import Field
from typing import Optional, List
from datetime import datetime, time
from models.user import User


class Medication(Document):
    """User medications"""
    user: Link[User]

    # Medication Info
    name: str
    dosage: str  # "500mg", "2 قرص"
    frequency: str  # "روزی 3 بار", "هر 8 ساعت"
    timing: List[time] = Field(default_factory=list)  # زمان‌های مصرف

    # Medical info
    purpose: Optional[str] = None  # دلیل مصرف
    side_effects: List[str] = Field(default_factory=list)
    food_interactions: List[str] = Field(default_factory=list)  # تداخل با غذا

    # AI Analysis
    dietary_restrictions: List[str] = Field(default_factory=list)
    recommended_foods: List[str] = Field(default_factory=list)
    foods_to_avoid: List[str] = Field(default_factory=list)
    ai_analyzed: bool = False

    # Dates
    start_date: datetime
    end_date: Optional[datetime] = None

    # Status
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "medications"
        indexes = ["user", "is_active"]
