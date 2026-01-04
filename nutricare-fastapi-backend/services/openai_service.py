import base64
import json
from typing import Dict, List, Optional
from openai import OpenAI
from config.settings import settings


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS

    def encode_image(self, image_path: str) -> str:
        """Encode image to base64"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    async def analyze_food_image(
        self, image_base64: str, meal_type: Optional[str] = None
    ) -> Dict:
        """
        Analyze food image and extract detailed nutrition info
        Returns: detected foods with calories, macros, cooking details
        """
        prompt = f"""
You are an expert nutritionist and food image analyzer. Please analyze this food image with complete accuracy.

Provide the following information in JSON format:

1. List of all foods detected in the image (detected_foods)
2. For each food:
   - Exact food name (name)
   - Estimated amount (estimated_amount: e.g., "100 grams", "1 cup", "2 pieces")
   - Calories (calories)
   - Protein (protein in grams)
   - Carbohydrates (carbs in grams)
   - Fats (fats in grams)
   - Fiber (fiber in grams)
   - Confidence (confidence between 0 and 1)
   - Description (description)
   - Cooking method (cooking_method)
   - Type of oil used (oil_type)
   - Amount of oil (oil_amount)
   - Additives and seasonings (additives: list)
   - Main ingredients (ingredients: list)

3. Total nutrition (total_nutrition):
   - Total calories
   - Total protein
   - Total carbohydrates
   - Total fats
   - Total fiber

4. Nutritional recommendations (recommendations: list of strings)

Output should be JSON only without additional explanation.

Meal type: {meal_type or 'Unknown'}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=self.max_tokens,
            )

            result_text = response.choices[0].message.content
            # Parse JSON from response
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in analyze_food_image: {e}")
            # Return default structure
            return {
                "detected_foods": [],
                "total_nutrition": {
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fats": 0,
                    "fiber": 0,
                },
                "recommendations": [f"Error analyzing image: {str(e)}"],
            }

    async def analyze_food_portion(
        self, before_image_base64: str, after_image_base64: str
    ) -> Dict:
        """
        Compare before and after images to calculate consumed percentage
        """
        prompt = """
You are an expert food image analyzer. You are given two images:
1. First image: food before consumption
2. Second image: food after consumption

Please calculate the following and output as JSON:

1. Consumed percentage (consumed_percentage: number between 0 and 100)
2. Description (description: brief explanation about remaining amount)
3. Initial calorie estimate (initial_calories)
4. Consumed calorie estimate (consumed_calories)
5. Remaining calorie estimate (remaining_calories)

Output should be JSON only:
{
  "consumed_percentage": 65,
  "description": "About two-thirds of the food was consumed",
  "initial_calories": 500,
  "consumed_calories": 325,
  "remaining_calories": 175
}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{before_image_base64}",
                                    "detail": "high",
                                },
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{after_image_base64}",
                                    "detail": "high",
                                },
                            },
                        ],
                    }
                ],
                max_tokens=1000,
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in analyze_food_portion: {e}")
            return {
                "consumed_percentage": 50,
                "description": f"Error in calculation: {str(e)}",
                "initial_calories": 0,
                "consumed_calories": 0,
                "remaining_calories": 0,
            }

    async def analyze_lab_test(self, image_base64: str, user_info: Dict) -> Dict:
        """
        Analyze lab test results from image
        """
        prompt = f"""
You are a doctor and nutrition expert. You are given a blood test image.

User information:
- Age: {user_info.get('age', 'Unknown')}
- Gender: {user_info.get('gender', 'Unknown')}
- Weight: {user_info.get('weight', 'Unknown')} kg
- Diseases: {', '.join(user_info.get('diseases', []))}

Please analyze the following and return as JSON:

1. Test results (test_results): list of
   - Test name (test_name)
   - Value (value)
   - Unit (unit)
   - Status (status: "Normal", "High", "Low")
   - Normal range (normal_range)

2. Health summary (health_summary)

3. Identified issues (identified_issues: list)

4. Nutritional recommendations (nutritional_recommendations: list)

5. Recommended foods (recommended_foods: list)

6. Foods to avoid (foods_to_avoid: list)

7. Priority level (priority_level: "Low", "Medium", "High", "Critical")

Output should be JSON only.
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                },
                            },
                        ],
                    }
                ],
                max_tokens=self.max_tokens,
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in analyze_lab_test: {e}")
            return {
                "test_results": [],
                "health_summary": f"Error in analysis: {str(e)}",
                "identified_issues": [],
                "nutritional_recommendations": [],
                "recommended_foods": [],
                "foods_to_avoid": [],
                "priority_level": "Unknown",
            }

    async def analyze_medications(
        self, medications: List[str], user_info: Dict
    ) -> Dict:
        """
        Analyze medication interactions and dietary recommendations
        """
        medications_str = "\n".join([f"- {med}" for med in medications])
        user_diseases = ", ".join(user_info.get("diseases", []))

        prompt = f"""
You are a pharmacist and nutrition expert.

User's medications:
{medications_str}

User's diseases: {user_diseases or 'None'}

Please analyze the following and return as JSON:

1. Drug interactions (drug_interactions):
   - Drug 1 (drug1)
   - Drug 2 (drug2)
   - Interaction type (interaction_type)
   - Severity (severity: "Low", "Medium", "High")
   - Description (description)

2. Food interactions (food_interactions):
   - Medication (medication)
   - Foods to avoid (foods_to_avoid)
   - Reason (reason)

3. Timing recommendations (timing_recommendations):
   - Medication (medication)
   - Recommended time (recommended_time: "Before meal", "With meal", "After meal")
   - Hours from meal (hours_from_meal)

4. Dietary restrictions (dietary_restrictions: list of strings)

5. Recommended foods (recommended_foods: list of strings)

6. Warnings (warnings: list of strings)

Output should be JSON only.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in analyze_medications: {e}")
            return {
                "drug_interactions": [],
                "food_interactions": [],
                "timing_recommendations": [],
                "dietary_restrictions": [],
                "recommended_foods": [],
                "warnings": [f"Error in analysis: {str(e)}"],
            }

    async def chat(
        self, message: str, conversation_history: List[Dict], user_context: Dict
    ) -> str:
        """
        Chat with AI nutritionist
        """
        system_prompt = f"""
You are an experienced nutrition and health expert. You respond in English.

User information:
- Age: {user_context.get('age', 'Unknown')}
- Gender: {user_context.get('gender', 'Unknown')}
- Weight: {user_context.get('weight', 'Unknown')} kg
- Height: {user_context.get('height', 'Unknown')} cm
- BMI: {user_context.get('bmi', 'Unknown')}
- Goal: {user_context.get('goal', 'Unknown')}
- Diseases: {', '.join(user_context.get('diseases', []))}
- Food allergies: {', '.join(user_context.get('allergies', []))}

Your responsibilities:
1. Answer nutrition questions with high accuracy
2. Provide personalized recommendations
3. Help achieve health goals
4. Warn about potential issues
5. Provide short, useful, and practical responses

If the question is a serious medical concern, recommend consulting a doctor.
"""

        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history[-10:])  # Last 10 messages for context
        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.model, messages=messages, max_tokens=1000, temperature=0.7
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in chat: {e}")
            return f"Sorry, an error occurred: {str(e)}"

    async def generate_meal_plan(self, user_info: Dict, preferences: Dict) -> Dict:
        """
        Generate personalized meal plan
        """
        prompt = f"""
You are a nutrition expert and meal planner.

User information:
- Age: {user_info.get('age')}
- Gender: {user_info.get('gender')}
- Weight: {user_info.get('weight')} kg
- Height: {user_info.get('height')} cm
- Activity level: {user_info.get('activity_level')}
- Goal: {user_info.get('goal')}
- Daily calorie target: {user_info.get('daily_calorie_target')}
- Diseases: {', '.join(user_info.get('diseases', []))}

User preferences:
- Budget: {preferences.get('budget')} {preferences.get('currency', 'USD')}
- City: {preferences.get('location', {}).get('city')}
- Country: {preferences.get('location', {}).get('country')}
- Available items at home: {', '.join(preferences.get('available_items', []))}
- Dietary restrictions: {', '.join(preferences.get('dietary_restrictions', []))}
- Duration: {preferences.get('duration_days', 7)} days

Please design a complete {preferences.get('duration_days', 7)}-day meal plan that includes:

1. Daily plans (daily_plans): list of
   - day (day number)
   - date (date)
   - meals:
     - breakfast: {{name, ingredients, calories, protein, carbs, fats, cost, recipe}}
     - lunch: {{same structure}}
     - dinner: {{same structure}}
     - snacks: list of snacks

2. Shopping list (shopping_list):
   - proteins: list (e.g., "Chicken: 2 kg - $15")
   - vegetables: list of vegetables
   - grains: list of grains
   - dairy: dairy products
   - others: other items
   - total_cost: total cost

3. Nutritional summary (nutritional_summary):
   - daily_avg_calories
   - daily_avg_protein
   - daily_avg_carbs
   - daily_avg_fats

4. Recommendations (recommendations: list)

Output should be JSON only. Prices should be realistic and appropriate for {preferences.get('location', {}).get('city')}.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
                temperature=0.7,
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in generate_meal_plan: {e}")
            return {
                "daily_plans": [],
                "shopping_list": {},
                "nutritional_summary": {},
                "recommendations": [f"Error generating plan: {str(e)}"],
            }

    async def generate_workout_plan(self, user_info: Dict) -> Dict:
        """
        Generate personalized workout plan
        """
        gender = user_info.get("gender")
        bmi = user_info.get("bmi")
        age = user_info.get("age")
        fitness_level = user_info.get("fitness_level", "beginner")
        goal = user_info.get("goal", "Fitness")

        # Determine focus based on gender
        if gender == "female":
            focus_areas = "Pilates, Yoga, Aerobics, Cardio, Light strength training"
        else:
            focus_areas = "Bodybuilding, Weightlifting, CrossFit, Cardio, Strength training"

        prompt = f"""
You are a professional fitness trainer.

User information:
- Age: {age}
- Gender: {gender}
- Weight: {user_info.get('weight')} kg
- BMI: {bmi}
- Fitness level: {fitness_level}
- Goal: {goal}

Focus areas based on gender: {focus_areas}

Please design a weekly workout plan that includes:

1. Recommended activities (recommended_activities): list of 4-5 suitable exercises

2. Weekly plan (weekly_plan): list of
   - day (day name in English)
   - exercises: list of
     - name (exercise name in English)
     - duration_minutes (duration)
     - intensity ("Low", "Medium", "High")
     - calories_burned (estimated calories burned)
     - description (brief description)
     - video_url (YouTube link - optional)

3. Safety tips (safety_tips: list)

4. Recommendations (recommendations: list)

5. Expected progress (expected_progress: string)

Output should be JSON only. Plan should be appropriate for gender {gender} and BMI {bmi}.
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
                temperature=0.7,
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            return result

        except Exception as e:
            print(f"Error in generate_workout_plan: {e}")
            return {
                "recommended_activities": [],
                "weekly_plan": [],
                "safety_tips": [],
                "recommendations": [f"Error generating plan: {str(e)}"],
                "expected_progress": "Unknown",
            }


# Singleton instance
openai_service = OpenAIService()
