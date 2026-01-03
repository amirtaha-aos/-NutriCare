from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

from models.user import User
from models.meal import Meal, MealType
from utils.dependencies import get_current_user

router = APIRouter()


# Request Models
class CreateMealRequest(BaseModel):
    meal_type: MealType
    name: str
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fats: float = Field(ge=0)
    fiber: Optional[float] = 0
    notes: Optional[str] = None
    consumed_percentage: Optional[float] = Field(None, ge=0, le=100)


@router.post("/")
async def create_meal(
    data: CreateMealRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new meal entry"""
    meal = Meal(
        user=current_user,
        meal_type=data.meal_type,
        name=data.name,
        calories=data.calories,
        protein=data.protein,
        carbs=data.carbs,
        fats=data.fats,
        fiber=data.fiber,
        notes=data.notes,
        consumed_percentage=data.consumed_percentage,
        consumed_at=datetime.utcnow(),
    )
    await meal.save()

    return {
        "success": True,
        "message": "Meal added successfully",
        "data": {
            "id": str(meal.id),
            "meal_type": meal.meal_type.value,
            "name": meal.name,
            "nutrition": meal.get_adjusted_nutrition(),
        }
    }


@router.get("/today")
async def get_today_meals(current_user: User = Depends(get_current_user)):
    """Get today's meals"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    meals = await Meal.find(
        Meal.user.id == current_user.id,
        Meal.consumed_at >= today_start,
        Meal.consumed_at <= today_end
    ).to_list()

    # Calculate totals
    total_calories = sum(m.get_adjusted_nutrition()["calories"] for m in meals)
    total_protein = sum(m.get_adjusted_nutrition()["protein"] for m in meals)
    total_carbs = sum(m.get_adjusted_nutrition()["carbs"] for m in meals)
    total_fats = sum(m.get_adjusted_nutrition()["fats"] for m in meals)

    # Get user targets
    daily_target = current_user.get_daily_calorie_target() or 2000

    return {
        "success": True,
        "data": {
            "meals": [
                {
                    "id": str(m.id),
                    "meal_type": m.meal_type.value,
                    "name": m.name,
                    "nutrition": m.get_adjusted_nutrition(),
                    "consumed_at": m.consumed_at.isoformat(),
                }
                for m in meals
            ],
            "totals": {
                "calories": round(total_calories, 2),
                "protein": round(total_protein, 2),
                "carbs": round(total_carbs, 2),
                "fats": round(total_fats, 2),
            },
            "targets": {
                "calories": daily_target,
                "protein": 120,
                "carbs": 200,
                "fats": 65,
            },
            "progress": {
                "calories_percentage": round((total_calories / daily_target) * 100, 2),
            }
        }
    }


@router.get("/date/{target_date}")
async def get_meals_by_date(
    target_date: str,
    current_user: User = Depends(get_current_user)
):
    """Get meals for a specific date (YYYY-MM-DD)"""
    try:
        date_obj = datetime.strptime(target_date, "%Y-%m-%d").date()
        start = datetime.combine(date_obj, datetime.min.time())
        end = datetime.combine(date_obj, datetime.max.time())

        meals = await Meal.find(
            Meal.user.id == current_user.id,
            Meal.consumed_at >= start,
            Meal.consumed_at <= end
        ).to_list()

        return {
            "success": True,
            "data": {
                "date": target_date,
                "meals": [
                    {
                        "id": str(m.id),
                        "meal_type": m.meal_type.value,
                        "name": m.name,
                        "nutrition": m.get_adjusted_nutrition(),
                    }
                    for m in meals
                ]
            }
        }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")


@router.get("/{meal_id}")
async def get_meal(
    meal_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get meal by ID"""
    meal = await Meal.get(meal_id)

    if not meal or meal.user.ref.id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")

    return {
        "success": True,
        "data": {
            "id": str(meal.id),
            "meal_type": meal.meal_type.value,
            "name": meal.name,
            "nutrition": meal.get_adjusted_nutrition(),
            "consumed_at": meal.consumed_at.isoformat(),
            "notes": meal.notes,
        }
    }


@router.delete("/{meal_id}")
async def delete_meal(
    meal_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a meal"""
    meal = await Meal.get(meal_id)

    if not meal or meal.user.ref.id != current_user.id:
        raise HTTPException(status_code=404, detail="Meal not found")

    await meal.delete()

    return {
        "success": True,
        "message": "Meal deleted successfully"
    }
