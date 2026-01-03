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
تو یک متخصص تغذیه و تحلیلگر تصویر غذا هستی. لطفاً این تصویر غذا را با دقت کامل تحلیل کن.

اطلاعات زیر را به صورت JSON ارائه بده:

1. لیست تمام غذاهایی که در تصویر می‌بینی (detected_foods)
2. برای هر غذا:
   - نام دقیق غذا (name)
   - تخمین مقدار (estimated_amount: مثلاً "100 گرم", "یک لیوان", "2 عدد")
   - کالری (calories)
   - پروتئین (protein در گرم)
   - کربوهیدرات (carbs در گرم)
   - چربی (fats در گرم)
   - فیبر (fiber در گرم)
   - اطمینان (confidence بین 0 تا 1)
   - توضیحات (description)
   - نحوه پخت (cooking_method)
   - نوع روغن استفاده شده (oil_type)
   - مقدار روغن (oil_amount)
   - افزودنی‌ها و چاشنی‌ها (additives: لیست)
   - مواد اصلی (ingredients: لیست)

3. مجموع تغذیه کل (total_nutrition):
   - کالری کل
   - پروتئین کل
   - کربوهیدرات کل
   - چربی کل
   - فیبر کل

4. توصیه‌های تغذیه‌ای (recommendations: لیست رشته‌ها)

خروجی فقط JSON باشد بدون توضیح اضافی.

وعده غذایی: {meal_type or 'نامشخص'}
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
                "recommendations": [f"خطا در تحلیل تصویر: {str(e)}"],
            }

    async def analyze_food_portion(
        self, before_image_base64: str, after_image_base64: str
    ) -> Dict:
        """
        Compare before and after images to calculate consumed percentage
        """
        prompt = """
تو یک متخصص تحلیل تصویر غذا هستی. دو تصویر به تو داده شده:
1. تصویر اول: غذا قبل از خوردن
2. تصویر دوم: غذا بعد از خوردن

لطفاً موارد زیر را محاسبه کن و به صورت JSON خروجی بده:

1. درصد مصرف شده (consumed_percentage: عدد بین 0 تا 100)
2. توضیح (description: توضیح کوتاه درباره مقدار باقی‌مانده)
3. تخمین کالری اولیه (initial_calories)
4. تخمین کالری مصرف شده (consumed_calories)
5. تخمین کالری باقی‌مانده (remaining_calories)

خروجی فقط JSON باشد:
{
  "consumed_percentage": 65,
  "description": "حدود دو سوم غذا مصرف شده",
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
                "description": f"خطا در محاسبه: {str(e)}",
                "initial_calories": 0,
                "consumed_calories": 0,
                "remaining_calories": 0,
            }

    async def analyze_lab_test(self, image_base64: str, user_info: Dict) -> Dict:
        """
        Analyze lab test results from image
        """
        prompt = f"""
تو یک پزشک و متخصص تغذیه هستی. یک تصویر آزمایش خون به تو داده شده.

اطلاعات کاربر:
- سن: {user_info.get('age', 'نامشخص')}
- جنسیت: {user_info.get('gender', 'نامشخص')}
- وزن: {user_info.get('weight', 'نامشخص')} کیلوگرم
- بیماری‌ها: {', '.join(user_info.get('diseases', []))}

لطفاً موارد زیر را تحلیل کن و به صورت JSON برگردان:

1. نتایج آزمایش (test_results): لیستی از
   - نام تست (test_name)
   - مقدار (value)
   - واحد (unit)
   - وضعیت (status: "نرمال", "بالا", "پایین")
   - محدوده نرمال (normal_range)

2. خلاصه وضعیت سلامت (health_summary)

3. مشکلات شناسایی شده (identified_issues: لیست)

4. توصیه‌های تغذیه‌ای (nutritional_recommendations: لیست)

5. غذاهای پیشنهادی (recommended_foods: لیست)

6. غذاهای ممنوع (foods_to_avoid: لیست)

7. سطح اولویت (priority_level: "کم", "متوسط", "بالا", "بحرانی")

خروجی فقط JSON باشد.
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
                "health_summary": f"خطا در تحلیل: {str(e)}",
                "identified_issues": [],
                "nutritional_recommendations": [],
                "recommended_foods": [],
                "foods_to_avoid": [],
                "priority_level": "نامشخص",
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
تو یک داروساز و متخصص تغذیه هستی.

داروهای مصرفی کاربر:
{medications_str}

بیماری‌های کاربر: {user_diseases or 'ندارد'}

لطفاً موارد زیر را تحلیل کن و به صورت JSON برگردان:

1. تداخلات دارویی (drug_interactions):
   - دارو 1 (drug1)
   - دارو 2 (drug2)
   - نوع تداخل (interaction_type)
   - شدت (severity: "کم", "متوسط", "بالا")
   - توضیح (description)

2. تداخل با غذا (food_interactions):
   - دارو (medication)
   - غذاهای ممنوع (foods_to_avoid)
   - دلیل (reason)

3. بهترین زمان مصرف (timing_recommendations):
   - دارو (medication)
   - زمان پیشنهادی (recommended_time: "قبل از غذا", "با غذا", "بعد از غذا")
   - فاصله از غذا (hours_from_meal)

4. محدودیت‌های غذایی (dietary_restrictions: لیست رشته‌ها)

5. غذاهای پیشنهادی (recommended_foods: لیست رشته‌ها)

6. هشدارها (warnings: لیست رشته‌ها)

خروجی فقط JSON باشد.
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
                "warnings": [f"خطا در تحلیل: {str(e)}"],
            }

    async def chat(
        self, message: str, conversation_history: List[Dict], user_context: Dict
    ) -> str:
        """
        Chat with AI nutritionist
        """
        system_prompt = f"""
تو یک متخصص تغذیه و سلامت با تجربه بالا هستی. به زبان فارسی پاسخ می‌دهی.

اطلاعات کاربر:
- سن: {user_context.get('age', 'نامشخص')}
- جنسیت: {user_context.get('gender', 'نامشخص')}
- وزن: {user_context.get('weight', 'نامشخص')} کیلوگرم
- قد: {user_context.get('height', 'نامشخص')} سانتی‌متر
- BMI: {user_context.get('bmi', 'نامشخص')}
- هدف: {user_context.get('goal', 'نامشخص')}
- بیماری‌ها: {', '.join(user_context.get('diseases', []))}
- حساسیت‌های غذایی: {', '.join(user_context.get('allergies', []))}

وظایف تو:
1. پاسخ به سوالات تغذیه‌ای با دقت بالا
2. ارائه توصیه‌های شخصی‌سازی شده
3. کمک به دستیابی به اهداف سلامتی
4. هشدار در مورد مشکلات احتمالی
5. پاسخ‌های کوتاه، مفید و عملی

اگر سوال پزشکی جدی است، توصیه کن که به پزشک مراجعه کند.
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
            return f"متأسفم، خطایی رخ داد: {str(e)}"

    async def generate_meal_plan(self, user_info: Dict, preferences: Dict) -> Dict:
        """
        Generate personalized meal plan
        """
        prompt = f"""
تو یک متخصص تغذیه و برنامه‌ریز غذایی هستی.

اطلاعات کاربر:
- سن: {user_info.get('age')}
- جنسیت: {user_info.get('gender')}
- وزن: {user_info.get('weight')} کیلوگرم
- قد: {user_info.get('height')} سانتی‌متر
- سطح فعالیت: {user_info.get('activity_level')}
- هدف: {user_info.get('goal')}
- کالری روزانه هدف: {user_info.get('daily_calorie_target')}
- بیماری‌ها: {', '.join(user_info.get('diseases', []))}

اولویت‌های کاربر:
- بودجه: {preferences.get('budget')} {preferences.get('currency', 'تومان')}
- شهر: {preferences.get('location', {}).get('city')}
- کشور: {preferences.get('location', {}).get('country')}
- مواد موجود در خانه: {', '.join(preferences.get('available_items', []))}
- محدودیت‌های غذایی: {', '.join(preferences.get('dietary_restrictions', []))}
- مدت زمان: {preferences.get('duration_days', 7)} روز

لطفاً یک برنامه غذایی کامل {preferences.get('duration_days', 7)} روزه طراحی کن که شامل:

1. برنامه روزانه (daily_plans): لیستی از
   - day (شماره روز)
   - date (تاریخ)
   - meals:
     - breakfast: {name, ingredients, calories, protein, carbs, fats, cost, recipe}
     - lunch: {همین ساختار}
     - dinner: {همین ساختار}
     - snacks: لیست میان‌وعده‌ها

2. لیست خرید (shopping_list):
   - proteins: لیست (مثلاً "مرغ: 2 کیلو - 180,000 تومان")
   - vegetables: لیست سبزیجات
   - grains: لیست غلات
   - dairy: لبنیات
   - others: سایر موارد
   - total_cost: هزینه کل

3. خلاصه تغذیه‌ای (nutritional_summary):
   - daily_avg_calories
   - daily_avg_protein
   - daily_avg_carbs
   - daily_avg_fats

4. توصیه‌ها (recommendations: لیست)

خروجی فقط JSON باشد. قیمت‌ها باید واقع‌بینانه و مناسب {preferences.get('location', {}).get('city')} باشند.
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
                "recommendations": [f"خطا در تولید برنامه: {str(e)}"],
            }

    async def generate_workout_plan(self, user_info: Dict) -> Dict:
        """
        Generate personalized workout plan
        """
        gender = user_info.get("gender")
        bmi = user_info.get("bmi")
        age = user_info.get("age")
        fitness_level = user_info.get("fitness_level", "beginner")
        goal = user_info.get("goal", "تناسب اندام")

        # Determine focus based on gender
        if gender == "female":
            focus_areas = "پیلاتس، یوگا، آئروبیک، کاردیو، تمرینات قدرتی سبک"
        else:
            focus_areas = "بدنسازی، وزنه، کراس‌فیت، کاردیو، تمرینات قدرتی"

        prompt = f"""
تو یک مربی ورزشی حرفه‌ای هستی.

اطلاعات کاربر:
- سن: {age}
- جنسیت: {gender}
- وزن: {user_info.get('weight')} کیلوگرم
- BMI: {bmi}
- سطح آمادگی: {fitness_level}
- هدف: {goal}

زمینه‌های تمرکز بر اساس جنسیت: {focus_areas}

لطفاً یک برنامه ورزشی هفتگی طراحی کن که شامل:

1. ورزش‌های پیشنهادی (recommended_activities): لیست 4-5 ورزش مناسب

2. برنامه هفتگی (weekly_plan): لیستی از
   - day (نام روز فارسی)
   - exercises: لیستی از
     - name (نام ورزش فارسی)
     - duration_minutes (مدت زمان)
     - intensity ("کم", "متوسط", "زیاد")
     - calories_burned (تخمین کالری سوخته)
     - description (توضیح کوتاه)
     - video_url (لینک یوتیوب - اختیاری)

3. نکات ایمنی (safety_tips: لیست)

4. توصیه‌ها (recommendations: لیست)

5. پیشرفت مورد انتظار (expected_progress: رشته)

خروجی فقط JSON باشد. برنامه باید متناسب با جنسیت {gender} و BMI {bmi} باشد.
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
                "recommendations": [f"خطا در تولید برنامه: {str(e)}"],
                "expected_progress": "نامشخص",
            }


# Singleton instance
openai_service = OpenAIService()
