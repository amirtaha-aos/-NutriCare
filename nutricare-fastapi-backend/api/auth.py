from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

from models.user import User, Gender, ActivityLevel, Goal
from utils.auth import hash_password, verify_password, create_access_token
from utils.dependencies import get_current_user

router = APIRouter()


# Request/Response Models
class RegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=2)
    last_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=10, le=120)
    gender: Optional[Gender] = None
    weight: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    activity_level: Optional[ActivityLevel] = None
    goal: Optional[Goal] = None
    target_weight: Optional[float] = None
    diseases: Optional[list[str]] = None
    allergies: Optional[list[str]] = None
    dietary_restrictions: Optional[list[str]] = None


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    bmr: Optional[float] = None
    tdee: Optional[float] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None
    daily_calorie_target: Optional[float] = None


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user"""
    # Check if user exists
    existing_user = await User.find_one(User.email == data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password_hash=hash_password(data.password),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    await user.save()

    # Create access token
    access_token = create_access_token({"sub": str(user.id)})

    return {
        "success": True,
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }


@router.post("/login")
async def login(data: LoginRequest):
    """Login user"""
    user = await User.find_one(User.email == data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    await user.save()

    # Create access token
    access_token = create_access_token({"sub": str(user.id)})

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    }


@router.get("/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    # Calculate health metrics
    current_user.calculate_bmi()
    current_user.calculate_bmr()
    current_user.calculate_tdee()
    current_user.calculate_ideal_weight()

    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "age": current_user.age,
            "gender": current_user.gender.value if current_user.gender else None,
            "weight": current_user.weight,
            "height": current_user.height,
            "bmi": current_user.bmi,
            "bmi_category": current_user.get_bmi_category(),
            "bmr": current_user.bmr,
            "tdee": current_user.tdee,
            "ideal_weight_min": current_user.ideal_weight_min,
            "ideal_weight_max": current_user.ideal_weight_max,
            "activity_level": current_user.activity_level.value if current_user.activity_level else None,
            "goal": current_user.goal.value if current_user.goal else None,
            "daily_calorie_target": current_user.get_daily_calorie_target(),
            "diseases": current_user.diseases,
            "allergies": current_user.allergies,
            "dietary_restrictions": current_user.dietary_restrictions,
        }
    }


@router.put("/profile")
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile"""
    # Update fields
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    if data.age is not None:
        current_user.age = data.age
    if data.gender is not None:
        current_user.gender = data.gender
    if data.weight is not None:
        current_user.weight = data.weight
    if data.height is not None:
        current_user.height = data.height
    if data.activity_level is not None:
        current_user.activity_level = data.activity_level
    if data.goal is not None:
        current_user.goal = data.goal
    if data.target_weight is not None:
        current_user.target_weight = data.target_weight
    if data.diseases is not None:
        current_user.diseases = data.diseases
    if data.allergies is not None:
        current_user.allergies = data.allergies
    if data.dietary_restrictions is not None:
        current_user.dietary_restrictions = data.dietary_restrictions

    # Recalculate health metrics
    current_user.calculate_bmi()
    current_user.calculate_bmr()
    current_user.calculate_tdee()
    current_user.calculate_ideal_weight()

    current_user.updated_at = datetime.utcnow()
    await current_user.save()

    return {
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            "id": str(current_user.id),
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "bmi": current_user.bmi,
            "bmr": current_user.bmr,
            "tdee": current_user.tdee,
            "daily_calorie_target": current_user.get_daily_calorie_target(),
        }
    }
