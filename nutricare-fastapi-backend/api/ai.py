from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import base64
import os
from datetime import datetime
import uuid

from models.user import User
from models.chat_history import ChatHistory
from models.meal_plan import MealPlan
from utils.dependencies import get_current_user
from services.openai_service import openai_service
from services.pdf_service import pdf_service

router = APIRouter()


# Request Models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class MealPlanRequest(BaseModel):
    budget: float
    currency: str = "تومان"
    location_city: str
    location_country: str = "ایران"
    available_items: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    duration_days: int = Field(7, ge=1, le=30)


class WorkoutPlanRequest(BaseModel):
    fitness_level: str = "beginner"  # beginner, intermediate, advanced
    goal: str = "تناسب اندام"


class AnalyzeMedicationsRequest(BaseModel):
    medications: List[str]


@router.post("/chat")
async def chat_with_ai(
    data: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Chat with AI nutritionist"""
    # Get or create chat session
    session_id = data.session_id or str(uuid.uuid4())

    chat_history = await ChatHistory.find_one(
        ChatHistory.user.id == current_user.id,
        ChatHistory.session_id == session_id
    )

    if not chat_history:
        chat_history = ChatHistory(
            user=current_user,
            session_id=session_id,
            user_context={
                "age": current_user.age,
                "gender": current_user.gender.value if current_user.gender else None,
                "weight": current_user.weight,
                "height": current_user.height,
                "bmi": current_user.bmi,
                "goal": current_user.goal.value if current_user.goal else None,
                "diseases": current_user.diseases,
                "allergies": current_user.allergies,
            }
        )

    # Add user message
    chat_history.add_message("user", data.message)

    # Get AI response
    try:
        ai_response = await openai_service.chat(
            message=data.message,
            conversation_history=chat_history.messages,
            user_context=chat_history.user_context
        )

        # Add AI message
        chat_history.add_message("assistant", ai_response)
        await chat_history.save()

        return {
            "success": True,
            "data": {
                "message": ai_response,
                "session_id": session_id,
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/analyze-food-image")
async def analyze_food_image(
    image: UploadFile = File(...),
    meal_type: str = "lunch",
    current_user: User = Depends(get_current_user)
):
    """Analyze food image and get nutrition info"""
    try:
        # Read and encode image
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Analyze with AI
        result = await openai_service.analyze_food_image(image_base64, meal_type)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-food-portion")
async def analyze_food_portion(
    before_image: UploadFile = File(...),
    after_image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Analyze before/after images to calculate consumed percentage"""
    try:
        # Read images
        before_bytes = await before_image.read()
        after_bytes = await after_image.read()

        before_base64 = base64.b64encode(before_bytes).decode('utf-8')
        after_base64 = base64.b64encode(after_bytes).decode('utf-8')

        # Analyze portion
        result = await openai_service.analyze_food_portion(before_base64, after_base64)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-lab-test")
async def analyze_lab_test(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Analyze lab test image"""
    try:
        # Read and encode image
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # User info for context
        user_info = {
            "age": current_user.age,
            "gender": current_user.gender.value if current_user.gender else None,
            "weight": current_user.weight,
            "diseases": current_user.diseases,
        }

        # Analyze with AI
        result = await openai_service.analyze_lab_test(image_base64, user_info)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-medications")
async def analyze_medications(
    data: AnalyzeMedicationsRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze medications and check interactions"""
    try:
        user_info = {
            "diseases": current_user.diseases,
            "allergies": current_user.allergies,
        }

        result = await openai_service.analyze_medications(data.medications, user_info)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/generate-meal-plan")
async def generate_meal_plan(
    data: MealPlanRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate personalized meal plan"""
    try:
        # Ensure user has health data
        if not current_user.weight or not current_user.height:
            raise HTTPException(
                status_code=400,
                detail="Please complete your profile (weight and height required)"
            )

        # Calculate health metrics
        current_user.calculate_bmi()
        current_user.calculate_bmr()
        current_user.calculate_tdee()

        # Prepare user info
        user_info = {
            "age": current_user.age,
            "gender": current_user.gender.value if current_user.gender else None,
            "weight": current_user.weight,
            "height": current_user.height,
            "activity_level": current_user.activity_level.value if current_user.activity_level else None,
            "goal": current_user.goal.value if current_user.goal else None,
            "daily_calorie_target": current_user.get_daily_calorie_target(),
            "diseases": current_user.diseases,
        }

        # Prepare preferences
        preferences = {
            "budget": data.budget,
            "currency": data.currency,
            "location": {
                "city": data.location_city,
                "country": data.location_country,
            },
            "available_items": data.available_items,
            "dietary_restrictions": data.dietary_restrictions + current_user.dietary_restrictions,
            "duration_days": data.duration_days,
        }

        # Generate with AI
        ai_result = await openai_service.generate_meal_plan(user_info, preferences)

        # Create meal plan in database
        meal_plan = MealPlan(
            user=current_user,
            title=f"برنامه غذایی {data.duration_days} روزه",
            start_date=datetime.now().date(),
            end_date=datetime.now().date(),
            duration_days=data.duration_days,
            budget=data.budget,
            currency=data.currency,
            location_city=data.location_city,
            location_country=data.location_country,
            available_items=data.available_items,
            dietary_restrictions=preferences["dietary_restrictions"],
            diseases=current_user.diseases,
            daily_plans=ai_result.get("daily_plans", []),
            shopping_list=ai_result.get("shopping_list", {}),
            total_budget_used=ai_result.get("shopping_list", {}).get("total_cost", 0),
            daily_calorie_target=current_user.get_daily_calorie_target() or 2000,
            daily_protein_target=120,
            daily_carbs_target=200,
            daily_fats_target=65,
            ai_recommendations=ai_result.get("recommendations", []),
        )
        await meal_plan.save()

        return {
            "success": True,
            "message": "Meal plan generated successfully",
            "data": {
                "meal_plan_id": str(meal_plan.id),
                "duration_days": data.duration_days,
                "daily_plans": ai_result.get("daily_plans", []),
                "shopping_list": ai_result.get("shopping_list", {}),
                "nutritional_summary": ai_result.get("nutritional_summary", {}),
                "recommendations": ai_result.get("recommendations", []),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/meal-plan/{meal_plan_id}/pdf")
async def download_meal_plan_pdf(
    meal_plan_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download meal plan as PDF"""
    try:
        meal_plan = await MealPlan.get(meal_plan_id)

        if not meal_plan or meal_plan.user.ref.id != current_user.id:
            raise HTTPException(status_code=404, detail="Meal plan not found")

        # Generate PDF
        pdf_filename = f"meal_plan_{meal_plan_id}.pdf"
        pdf_path = os.path.join("generated_pdfs", pdf_filename)

        meal_plan_data = {
            "user_info": {
                "age": current_user.age,
                "gender": current_user.gender.value if current_user.gender else None,
                "weight": current_user.weight,
                "height": current_user.height,
                "goal": current_user.goal.value if current_user.goal else None,
                "daily_calorie_target": meal_plan.daily_calorie_target,
            },
            "duration_days": meal_plan.duration_days,
            "daily_plans": meal_plan.daily_plans,
            "shopping_list": meal_plan.shopping_list,
            "nutritional_summary": {
                "daily_avg_calories": meal_plan.daily_calorie_target,
                "daily_avg_protein": meal_plan.daily_protein_target,
                "daily_avg_carbs": meal_plan.daily_carbs_target,
                "daily_avg_fats": meal_plan.daily_fats_target,
            },
            "recommendations": meal_plan.ai_recommendations,
        }

        await pdf_service.generate_meal_plan_pdf(meal_plan_data, pdf_path)

        # Update meal plan
        meal_plan.pdf_url = f"/static/{pdf_filename}"
        meal_plan.pdf_generated_at = datetime.utcnow()
        await meal_plan.save()

        return {
            "success": True,
            "data": {
                "pdf_url": meal_plan.pdf_url,
                "download_url": f"http://localhost:8000{meal_plan.pdf_url}"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/generate-workout-plan")
async def generate_workout_plan(
    data: WorkoutPlanRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate personalized workout plan"""
    try:
        # Ensure user has health data
        if not current_user.weight or not current_user.height:
            raise HTTPException(
                status_code=400,
                detail="Please complete your profile (weight and height required)"
            )

        # Calculate BMI
        current_user.calculate_bmi()

        user_info = {
            "age": current_user.age,
            "gender": current_user.gender.value if current_user.gender else None,
            "weight": current_user.weight,
            "height": current_user.height,
            "bmi": current_user.bmi,
            "fitness_level": data.fitness_level,
            "goal": data.goal,
        }

        # Generate with AI
        result = await openai_service.generate_workout_plan(user_info)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
