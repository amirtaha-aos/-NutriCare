from typing import Dict
from models.user import Gender, ActivityLevel, Goal


class NutritionService:
    def calculate_bmi(self, weight_kg: float, height_cm: float) -> float:
        """Calculate BMI"""
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        return round(bmi, 2)

    def get_bmi_category(self, bmi: float) -> str:
        """Get BMI category in Persian"""
        if bmi < 18.5:
            return "کم‌وزن"
        elif 18.5 <= bmi < 25:
            return "وزن نرمال"
        elif 25 <= bmi < 30:
            return "اضافه‌وزن"
        else:
            return "چاقی"

    def calculate_bmr(
        self, weight_kg: float, height_cm: float, age: int, gender: Gender
    ) -> float:
        """
        Calculate BMR using Mifflin-St Jeor Equation
        Men: BMR = 10W + 6.25H - 5A + 5
        Women: BMR = 10W + 6.25H - 5A - 161
        """
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)

        if gender == Gender.MALE:
            bmr += 5
        else:
            bmr -= 161

        return round(bmr, 2)

    def calculate_tdee(self, bmr: float, activity_level: ActivityLevel) -> float:
        """Calculate TDEE (Total Daily Energy Expenditure)"""
        activity_multipliers = {
            ActivityLevel.SEDENTARY: 1.2,
            ActivityLevel.LIGHT: 1.375,
            ActivityLevel.MODERATE: 1.55,
            ActivityLevel.ACTIVE: 1.725,
            ActivityLevel.VERY_ACTIVE: 1.9,
        }

        multiplier = activity_multipliers.get(activity_level, 1.55)
        tdee = bmr * multiplier
        return round(tdee, 2)

    def calculate_daily_calorie_target(self, tdee: float, goal: Goal) -> float:
        """Calculate daily calorie target based on goal"""
        if goal == Goal.WEIGHT_LOSS:
            return round(tdee - 500, 2)  # کسری 500 کالری
        elif goal == Goal.MUSCLE_GAIN:
            return round(tdee + 300, 2)  # اضافه 300 کالری
        else:  # MAINTAIN
            return tdee

    def calculate_macros(
        self, daily_calories: float, goal: Goal
    ) -> Dict[str, float]:
        """
        Calculate macro distribution (protein, carbs, fats)
        """
        if goal == Goal.WEIGHT_LOSS:
            # Higher protein for weight loss
            protein_percentage = 0.30
            carbs_percentage = 0.40
            fats_percentage = 0.30
        elif goal == Goal.MUSCLE_GAIN:
            # Balanced for muscle gain
            protein_percentage = 0.30
            carbs_percentage = 0.45
            fats_percentage = 0.25
        else:  # MAINTAIN
            protein_percentage = 0.25
            carbs_percentage = 0.45
            fats_percentage = 0.30

        # Calculate grams
        # Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
        protein_calories = daily_calories * protein_percentage
        carbs_calories = daily_calories * carbs_percentage
        fats_calories = daily_calories * fats_percentage

        return {
            "daily_calories": daily_calories,
            "protein_grams": round(protein_calories / 4, 2),
            "carbs_grams": round(carbs_calories / 4, 2),
            "fats_grams": round(fats_calories / 9, 2),
            "protein_percentage": protein_percentage * 100,
            "carbs_percentage": carbs_percentage * 100,
            "fats_percentage": fats_percentage * 100,
        }

    def calculate_ideal_weight_range(self, height_cm: float) -> Dict[str, float]:
        """Calculate ideal weight range based on healthy BMI (18.5-24.9)"""
        height_m = height_cm / 100
        min_weight = 18.5 * (height_m ** 2)
        max_weight = 24.9 * (height_m ** 2)

        return {
            "min_weight_kg": round(min_weight, 2),
            "max_weight_kg": round(max_weight, 2),
        }

    def estimate_body_fat_percentage(
        self, bmi: float, age: int, gender: Gender
    ) -> float:
        """
        Estimate body fat percentage using BMI
        Formula from Deurenberg et al.
        """
        if gender == Gender.MALE:
            body_fat = (1.20 * bmi) + (0.23 * age) - 16.2
        else:  # FEMALE
            body_fat = (1.20 * bmi) + (0.23 * age) - 5.4

        return round(max(0, body_fat), 2)

    def get_water_intake_recommendation(self, weight_kg: float) -> int:
        """
        Calculate recommended daily water intake
        Formula: 30-35 ml per kg body weight
        """
        water_ml = weight_kg * 35
        return int(water_ml)

    def analyze_daily_nutrition(
        self,
        consumed_calories: float,
        consumed_protein: float,
        consumed_carbs: float,
        consumed_fats: float,
        target_calories: float,
        target_protein: float,
        target_carbs: float,
        target_fats: float,
    ) -> Dict:
        """
        Analyze daily nutrition vs targets
        """
        calorie_diff = consumed_calories - target_calories
        protein_diff = consumed_protein - target_protein
        carbs_diff = consumed_carbs - target_carbs
        fats_diff = consumed_fats - target_fats

        calorie_percentage = (consumed_calories / target_calories * 100) if target_calories > 0 else 0
        protein_percentage = (consumed_protein / target_protein * 100) if target_protein > 0 else 0
        carbs_percentage = (consumed_carbs / target_carbs * 100) if target_carbs > 0 else 0
        fats_percentage = (consumed_fats / target_fats * 100) if target_fats > 0 else 0

        # Recommendations
        recommendations = []

        if calorie_diff > 200:
            recommendations.append("کالری مصرفی بیش از حد هدف است. فعالیت بدنی را افزایش دهید.")
        elif calorie_diff < -200:
            recommendations.append("کالری مصرفی کمتر از هدف است. یک میان‌وعده سالم اضافه کنید.")

        if protein_percentage < 80:
            recommendations.append("پروتئین کافی مصرف نمی‌کنید. منابع پروتئینی بیشتری مصرف کنید.")

        if carbs_percentage > 120:
            recommendations.append("کربوهیدرات بیش از حد مصرف کرده‌اید. کربوهیدرات‌های ساده را کاهش دهید.")

        if fats_percentage > 120:
            recommendations.append("چربی مصرفی بالا است. از چربی‌های سالم استفاده کنید.")

        return {
            "consumed": {
                "calories": consumed_calories,
                "protein": consumed_protein,
                "carbs": consumed_carbs,
                "fats": consumed_fats,
            },
            "target": {
                "calories": target_calories,
                "protein": target_protein,
                "carbs": target_carbs,
                "fats": target_fats,
            },
            "difference": {
                "calories": round(calorie_diff, 2),
                "protein": round(protein_diff, 2),
                "carbs": round(carbs_diff, 2),
                "fats": round(fats_diff, 2),
            },
            "percentage": {
                "calories": round(calorie_percentage, 2),
                "protein": round(protein_percentage, 2),
                "carbs": round(carbs_percentage, 2),
                "fats": round(fats_percentage, 2),
            },
            "recommendations": recommendations,
        }


# Singleton instance
nutrition_service = NutritionService()
