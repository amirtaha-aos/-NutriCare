from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date, timedelta

from models.user import User
from models.exercise import ExerciseLog, IntensityLevel, ExerciseCategory
from utils.dependencies import get_current_user
from services.exercise_service import exercise_service

router = APIRouter()


# Request Models
class LogExerciseRequest(BaseModel):
    exercise_type: str
    duration_minutes: int = Field(gt=0)
    intensity: IntensityLevel = IntensityLevel.MODERATE
    distance: Optional[float] = None
    weight_lifted: Optional[float] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    notes: Optional[str] = None


@router.post("/log")
async def log_exercise(
    data: LogExerciseRequest,
    current_user: User = Depends(get_current_user)
):
    """Log an exercise session"""
    if not current_user.weight:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Please set your weight in profile first"
        )

    # Get MET value
    met_value = exercise_service.get_met_value(data.exercise_type, data.intensity)

    # Calculate calories
    calories_result = exercise_service.calculate_calories_burned(
        exercise_type=data.exercise_type,
        duration_minutes=data.duration_minutes,
        user_weight_kg=current_user.weight,
        intensity=data.intensity
    )

    # Determine category
    category = ExerciseCategory.OTHER
    if "دو" in data.exercise_type or "پیاده" in data.exercise_type:
        category = ExerciseCategory.CARDIO
    elif "وزنه" in data.exercise_type or "بدنسازی" in data.exercise_type:
        category = ExerciseCategory.STRENGTH
    elif "یوگا" in data.exercise_type or "پیلاتس" in data.exercise_type:
        category = ExerciseCategory.FLEXIBILITY

    # Create exercise log
    exercise_log = ExerciseLog(
        user=current_user,
        exercise_type=data.exercise_type,
        exercise_category=category,
        duration_minutes=data.duration_minutes,
        intensity=data.intensity,
        met_value=met_value,
        calories_burned=calories_result["calories_burned"],
        distance=data.distance,
        weight_lifted=data.weight_lifted,
        sets=data.sets,
        reps=data.reps,
        notes=data.notes,
        performed_at=datetime.utcnow(),
    )
    await exercise_log.save()

    return {
        "success": True,
        "message": "Exercise logged successfully",
        "data": {
            "id": str(exercise_log.id),
            "exercise_type": exercise_log.exercise_type,
            "duration_minutes": exercise_log.duration_minutes,
            "calories_burned": exercise_log.calories_burned,
            "calculation_details": calories_result["calculation_details"],
        }
    }


@router.get("/history")
async def get_exercise_history(
    days: int = 7,
    current_user: User = Depends(get_current_user)
):
    """Get exercise history"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    exercises = await ExerciseLog.find(
        ExerciseLog.user.id == current_user.id,
        ExerciseLog.performed_at >= start_date,
        ExerciseLog.performed_at <= end_date
    ).sort("-performed_at").to_list()

    total_calories = sum(e.calories_burned for e in exercises)
    total_duration = sum(e.duration_minutes for e in exercises)

    return {
        "success": True,
        "data": {
            "exercises": [
                {
                    "id": str(e.id),
                    "exercise_type": e.exercise_type,
                    "duration_minutes": e.duration_minutes,
                    "intensity": e.intensity.value,
                    "calories_burned": e.calories_burned,
                    "performed_at": e.performed_at.isoformat(),
                }
                for e in exercises
            ],
            "summary": {
                "total_exercises": len(exercises),
                "total_duration_minutes": total_duration,
                "total_calories_burned": round(total_calories, 2),
                "average_calories_per_session": round(total_calories / len(exercises), 2) if exercises else 0,
            }
        }
    }


@router.get("/today")
async def get_today_exercises(current_user: User = Depends(get_current_user)):
    """Get today's exercises"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    exercises = await ExerciseLog.find(
        ExerciseLog.user.id == current_user.id,
        ExerciseLog.performed_at >= today_start,
        ExerciseLog.performed_at <= today_end
    ).to_list()

    total_calories = sum(e.calories_burned for e in exercises)
    total_duration = sum(e.duration_minutes for e in exercises)

    return {
        "success": True,
        "data": {
            "exercises": [
                {
                    "id": str(e.id),
                    "exercise_type": e.exercise_type,
                    "duration_minutes": e.duration_minutes,
                    "calories_burned": e.calories_burned,
                }
                for e in exercises
            ],
            "summary": {
                "total_duration_minutes": total_duration,
                "total_calories_burned": round(total_calories, 2),
            }
        }
    }


@router.get("/types")
async def get_exercise_types():
    """Get all available exercise types"""
    exercises = exercise_service.get_all_exercises()

    return {
        "success": True,
        "data": {
            "exercises": exercises
        }
    }


@router.get("/recommendations")
async def get_exercise_recommendations(current_user: User = Depends(get_current_user)):
    """Get personalized exercise recommendations"""
    if not current_user.bmi or not current_user.gender:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Please complete your profile (height, weight, gender required)"
        )

    current_user.calculate_bmi()

    if current_user.gender.value == "female":
        recommendations = exercise_service.get_recommended_exercises_for_female(
            bmi=current_user.bmi,
            goal=current_user.goal.value if current_user.goal else "maintain"
        )
    else:
        recommendations = exercise_service.get_recommended_exercises_for_male(
            bmi=current_user.bmi,
            goal=current_user.goal.value if current_user.goal else "maintain"
        )

    return {
        "success": True,
        "data": {
            "recommended_exercises": recommendations,
            "based_on": {
                "bmi": current_user.bmi,
                "bmi_category": current_user.get_bmi_category(),
                "gender": current_user.gender.value,
                "goal": current_user.goal.value if current_user.goal else "maintain",
            }
        }
    }


@router.delete("/{exercise_id}")
async def delete_exercise(
    exercise_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an exercise log"""
    exercise = await ExerciseLog.get(exercise_id)

    if not exercise or exercise.user.ref.id != current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Exercise not found")

    await exercise.delete()

    return {
        "success": True,
        "message": "Exercise deleted successfully"
    }
