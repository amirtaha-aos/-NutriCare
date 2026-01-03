from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date, timedelta

from models.user import User
from models.health_log import HealthLog
from models.meal import Meal
from models.exercise import ExerciseLog
from utils.dependencies import get_current_user
from services.nutrition_service import nutrition_service

router = APIRouter()


# Request Models
class UpdateHealthLogRequest(BaseModel):
    weight: Optional[float] = Field(None, gt=0)
    water_intake_ml: Optional[int] = Field(None, ge=0)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sleep_quality: Optional[int] = Field(None, ge=1, le=5)
    steps: Optional[int] = Field(None, ge=0)
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    blood_sugar: Optional[float] = None
    mood: Optional[str] = None
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None


@router.get("/dashboard")
async def get_health_dashboard(current_user: User = Depends(get_current_user)):
    """Get health dashboard data"""
    # Get today's health log
    today = date.today()
    health_log = await HealthLog.find_one(
        HealthLog.user.id == current_user.id,
        HealthLog.date == today
    )

    # Get today's meals
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    meals = await Meal.find(
        Meal.user.id == current_user.id,
        Meal.consumed_at >= today_start,
        Meal.consumed_at <= today_end
    ).to_list()

    # Calculate meal totals
    total_calories = sum(m.get_adjusted_nutrition()["calories"] for m in meals)
    total_protein = sum(m.get_adjusted_nutrition()["protein"] for m in meals)
    total_carbs = sum(m.get_adjusted_nutrition()["carbs"] for m in meals)
    total_fats = sum(m.get_adjusted_nutrition()["fats"] for m in meals)

    # Get today's exercises
    exercises = await ExerciseLog.find(
        ExerciseLog.user.id == current_user.id,
        ExerciseLog.performed_at >= today_start,
        ExerciseLog.performed_at <= today_end
    ).to_list()

    total_exercise_calories = sum(e.calories_burned for e in exercises)

    # Calculate health metrics
    current_user.calculate_bmi()
    current_user.calculate_bmr()
    current_user.calculate_tdee()

    daily_target = current_user.get_daily_calorie_target() or 2000

    return {
        "success": True,
        "data": {
            "user_stats": {
                "weight": current_user.weight,
                "bmi": current_user.bmi,
                "bmi_category": current_user.get_bmi_category(),
                "bmr": current_user.bmr,
                "tdee": current_user.tdee,
                "daily_calorie_target": daily_target,
            },
            "today": {
                "calories_consumed": round(total_calories, 2),
                "calories_burned": round(total_exercise_calories, 2),
                "net_calories": round(total_calories - total_exercise_calories, 2),
                "protein": round(total_protein, 2),
                "carbs": round(total_carbs, 2),
                "fats": round(total_fats, 2),
                "water_intake_ml": health_log.water_intake_ml if health_log else 0,
                "steps": health_log.steps if health_log else 0,
                "sleep_hours": health_log.sleep_hours if health_log else 0,
            },
            "progress": {
                "calorie_progress": round((total_calories / daily_target) * 100, 2),
                "water_progress": round((health_log.water_intake_ml / 2000) * 100, 2) if health_log else 0,
                "steps_progress": round((health_log.steps / 10000) * 100, 2) if health_log else 0,
            }
        }
    }


@router.get("/today")
async def get_today_health_log(current_user: User = Depends(get_current_user)):
    """Get today's health log"""
    today = date.today()
    health_log = await HealthLog.find_one(
        HealthLog.user.id == current_user.id,
        HealthLog.date == today
    )

    if not health_log:
        # Create empty log
        health_log = HealthLog(
            user=current_user,
            date=today,
        )
        await health_log.save()

    return {
        "success": True,
        "data": {
            "date": str(health_log.date),
            "weight": health_log.weight,
            "water_intake_ml": health_log.water_intake_ml,
            "water_goal_ml": health_log.water_goal_ml,
            "sleep_hours": health_log.sleep_hours,
            "sleep_quality": health_log.sleep_quality,
            "steps": health_log.steps,
            "steps_goal": health_log.steps_goal,
            "mood": health_log.mood,
            "energy_level": health_log.energy_level,
        }
    }


@router.put("/today")
async def update_today_health_log(
    data: UpdateHealthLogRequest,
    current_user: User = Depends(get_current_user)
):
    """Update today's health log"""
    today = date.today()
    health_log = await HealthLog.find_one(
        HealthLog.user.id == current_user.id,
        HealthLog.date == today
    )

    if not health_log:
        health_log = HealthLog(
            user=current_user,
            date=today,
        )

    # Update fields
    if data.weight is not None:
        health_log.weight = data.weight
        current_user.weight = data.weight
        current_user.calculate_bmi()
        await current_user.save()

    if data.water_intake_ml is not None:
        health_log.water_intake_ml = data.water_intake_ml
    if data.sleep_hours is not None:
        health_log.sleep_hours = data.sleep_hours
    if data.sleep_quality is not None:
        health_log.sleep_quality = data.sleep_quality
    if data.steps is not None:
        health_log.steps = data.steps
    if data.blood_pressure_systolic is not None:
        health_log.blood_pressure_systolic = data.blood_pressure_systolic
    if data.blood_pressure_diastolic is not None:
        health_log.blood_pressure_diastolic = data.blood_pressure_diastolic
    if data.blood_sugar is not None:
        health_log.blood_sugar = data.blood_sugar
    if data.mood is not None:
        health_log.mood = data.mood
    if data.energy_level is not None:
        health_log.energy_level = data.energy_level
    if data.notes is not None:
        health_log.notes = data.notes

    health_log.updated_at = datetime.utcnow()
    await health_log.save()

    return {
        "success": True,
        "message": "Health log updated successfully",
        "data": {
            "weight": health_log.weight,
            "water_intake_ml": health_log.water_intake_ml,
            "steps": health_log.steps,
        }
    }


@router.post("/water/add")
async def add_water(
    amount_ml: int = 250,
    current_user: User = Depends(get_current_user)
):
    """Add water intake (default: 250ml glass)"""
    today = date.today()
    health_log = await HealthLog.find_one(
        HealthLog.user.id == current_user.id,
        HealthLog.date == today
    )

    if not health_log:
        health_log = HealthLog(
            user=current_user,
            date=today,
        )

    health_log.water_intake_ml += amount_ml
    await health_log.save()

    return {
        "success": True,
        "message": f"Added {amount_ml}ml water",
        "data": {
            "total_water_ml": health_log.water_intake_ml,
            "goal_ml": health_log.water_goal_ml,
            "progress": round((health_log.water_intake_ml / health_log.water_goal_ml) * 100, 2)
        }
    }


@router.get("/weight/history")
async def get_weight_history(
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    """Get weight history"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    health_logs = await HealthLog.find(
        HealthLog.user.id == current_user.id,
        HealthLog.date >= start_date,
        HealthLog.date <= end_date,
        HealthLog.weight != None
    ).sort("+date").to_list()

    return {
        "success": True,
        "data": {
            "history": [
                {
                    "date": str(log.date),
                    "weight": log.weight,
                }
                for log in health_logs
            ]
        }
    }


@router.post("/weight")
async def log_weight(
    weight: float,
    current_user: User = Depends(get_current_user)
):
    """Log weight for today"""
    today = date.today()
    health_log = await HealthLog.find_one(
        HealthLog.user.id == current_user.id,
        HealthLog.date == today
    )

    if not health_log:
        health_log = HealthLog(
            user=current_user,
            date=today,
        )

    health_log.weight = weight
    await health_log.save()

    # Update user profile
    current_user.weight = weight
    current_user.calculate_bmi()
    await current_user.save()

    return {
        "success": True,
        "message": "Weight logged successfully",
        "data": {
            "weight": weight,
            "bmi": current_user.bmi,
            "bmi_category": current_user.get_bmi_category(),
        }
    }
