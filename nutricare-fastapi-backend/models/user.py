from beanie import Document
from pydantic import EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"  # خیلی کم تحرک
    LIGHT = "light"  # کم تحرک
    MODERATE = "moderate"  # متوسط
    ACTIVE = "active"  # فعال
    VERY_ACTIVE = "very_active"  # خیلی فعال


class Goal(str, Enum):
    WEIGHT_LOSS = "weight_loss"  # کاهش وزن
    MAINTAIN = "maintain"  # حفظ وزن
    MUSCLE_GAIN = "muscle_gain"  # افزایش عضله


class User(Document):
    # Basic Info
    first_name: str
    last_name: str
    email: EmailStr = Field(unique=True, index=True)
    password_hash: str

    # Personal Info
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight: Optional[float] = None  # kg
    height: Optional[float] = None  # cm

    # Health Goals
    activity_level: Optional[ActivityLevel] = ActivityLevel.MODERATE
    goal: Optional[Goal] = Goal.MAINTAIN
    target_weight: Optional[float] = None

    # Medical Info
    diseases: List[str] = Field(default_factory=list)  # ['دیابت', 'فشار خون بالا']
    allergies: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)  # ['بدون لبنیات', 'حلال']

    # Calculated Values
    bmi: Optional[float] = None
    bmr: Optional[float] = None  # Basal Metabolic Rate
    tdee: Optional[float] = None  # Total Daily Energy Expenditure
    ideal_weight_min: Optional[float] = None
    ideal_weight_max: Optional[float] = None

    # Samsung Health Integration
    samsung_access_token: Optional[str] = None
    samsung_refresh_token: Optional[str] = None
    samsung_token_expiry: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    # Settings
    is_active: bool = True
    notifications_enabled: bool = True

    class Settings:
        name = "users"
        indexes = ["email"]

    def calculate_bmi(self) -> Optional[float]:
        """Calculate BMI (Body Mass Index)"""
        if self.weight and self.height:
            height_m = self.height / 100
            self.bmi = round(self.weight / (height_m ** 2), 2)
            return self.bmi
        return None

    def calculate_bmr(self) -> Optional[float]:
        """
        Calculate BMR using Mifflin-St Jeor Equation
        Men: BMR = 10W + 6.25H - 5A + 5
        Women: BMR = 10W + 6.25H - 5A - 161
        """
        if self.weight and self.height and self.age and self.gender:
            bmr = (10 * self.weight) + (6.25 * self.height) - (5 * self.age)
            if self.gender == Gender.MALE:
                bmr += 5
            else:
                bmr -= 161
            self.bmr = round(bmr, 2)
            return self.bmr
        return None

    def calculate_tdee(self) -> Optional[float]:
        """Calculate TDEE (Total Daily Energy Expenditure)"""
        if not self.bmr:
            self.calculate_bmr()

        if self.bmr:
            activity_multipliers = {
                ActivityLevel.SEDENTARY: 1.2,
                ActivityLevel.LIGHT: 1.375,
                ActivityLevel.MODERATE: 1.55,
                ActivityLevel.ACTIVE: 1.725,
                ActivityLevel.VERY_ACTIVE: 1.9,
            }
            multiplier = activity_multipliers.get(self.activity_level, 1.55)
            self.tdee = round(self.bmr * multiplier, 2)
            return self.tdee
        return None

    def calculate_ideal_weight(self) -> tuple:
        """Calculate ideal weight range based on BMI"""
        if self.height:
            height_m = self.height / 100
            # BMI 18.5 - 24.9 is considered healthy
            self.ideal_weight_min = round(18.5 * (height_m ** 2), 2)
            self.ideal_weight_max = round(24.9 * (height_m ** 2), 2)
            return (self.ideal_weight_min, self.ideal_weight_max)
        return (None, None)

    def get_bmi_category(self) -> str:
        """Get BMI category"""
        if not self.bmi:
            self.calculate_bmi()

        if self.bmi:
            if self.bmi < 18.5:
                return "کم‌وزن"
            elif 18.5 <= self.bmi < 25:
                return "وزن نرمال"
            elif 25 <= self.bmi < 30:
                return "اضافه‌وزن"
            else:
                return "چاقی"
        return "نامشخص"

    def get_daily_calorie_target(self) -> Optional[float]:
        """Get daily calorie target based on goal"""
        if not self.tdee:
            self.calculate_tdee()

        if self.tdee:
            if self.goal == Goal.WEIGHT_LOSS:
                return round(self.tdee - 500, 2)  # کسری 500 کالری
            elif self.goal == Goal.MUSCLE_GAIN:
                return round(self.tdee + 300, 2)  # اضافه 300 کالری
            else:
                return self.tdee
        return None
