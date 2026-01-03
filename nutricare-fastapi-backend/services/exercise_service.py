from typing import Dict, List
from models.exercise import IntensityLevel


class ExerciseService:
    # MET values for different exercises
    # Source: Compendium of Physical Activities
    EXERCISE_MET_VALUES = {
        # کاردیو
        "دویدن": 9.0,
        "پیاده‌روی سریع": 4.5,
        "پیاده‌روی آرام": 3.0,
        "دوچرخه‌سواری": 7.5,
        "شنا": 8.0,
        "طناب زدن": 11.0,

        # ورزش‌های قدرتی
        "بدنسازی": 6.0,
        "وزنه": 6.5,
        "کراس‌فیت": 8.0,

        # ورزش‌های گروهی - زنانه
        "پیلاتس": 3.5,
        "یوگا": 3.0,
        "آئروبیک": 6.5,
        "زومبا": 7.0,

        # ورزش‌های مختلف
        "اسب‌سواری": 5.5,
        "تنیس": 7.0,
        "فوتبال": 8.5,
        "بسکتبال": 7.5,
        "والیبال": 4.0,
        "تیراندازی با کمان": 3.5,
        "کوهنوردی": 6.5,
        "اسکی": 7.0,
        "کشتی": 9.0,
        "بوکس": 9.5,
        "کاراته": 8.0,
        "تکواندو": 8.0,

        # فعالیت‌های روزمره
        "باغبانی": 4.0,
        "نظافت خانه": 3.5,
        "بازی با بچه‌ها": 5.0,
    }

    def get_met_value(self, exercise_type: str, intensity: IntensityLevel) -> float:
        """
        Get MET value for exercise with intensity adjustment
        """
        base_met = self.EXERCISE_MET_VALUES.get(exercise_type, 5.0)

        # Adjust for intensity
        intensity_multipliers = {
            IntensityLevel.LOW: 0.8,
            IntensityLevel.MODERATE: 1.0,
            IntensityLevel.HIGH: 1.2,
            IntensityLevel.VERY_HIGH: 1.4,
        }

        multiplier = intensity_multipliers.get(intensity, 1.0)
        return base_met * multiplier

    def calculate_calories_burned(
        self,
        exercise_type: str,
        duration_minutes: int,
        user_weight_kg: float,
        intensity: IntensityLevel = IntensityLevel.MODERATE
    ) -> Dict:
        """
        Calculate calories burned using MET formula
        Calories = MET × weight(kg) × duration(hours)
        """
        met_value = self.get_met_value(exercise_type, intensity)
        duration_hours = duration_minutes / 60

        calories_burned = met_value * user_weight_kg * duration_hours

        return {
            "exercise_type": exercise_type,
            "duration_minutes": duration_minutes,
            "intensity": intensity.value,
            "met_value": round(met_value, 2),
            "calories_burned": round(calories_burned, 2),
            "calculation_details": {
                "formula": "MET × وزن(kg) × زمان(ساعت)",
                "user_weight": user_weight_kg,
                "met": met_value,
                "duration_hours": duration_hours,
            }
        }

    def get_recommended_exercises_for_female(self, bmi: float, goal: str) -> List[str]:
        """
        Get recommended exercises for women based on BMI and goal
        """
        recommendations = []

        if bmi < 18.5:  # کم‌وزن
            recommendations = ["یوگا", "پیلاتس", "پیاده‌روی آرام", "شنا"]
        elif 18.5 <= bmi < 25:  # نرمال
            if goal == "muscle_gain":
                recommendations = ["پیلاتس", "بدنسازی", "آئروبیک", "شنا", "دوچرخه‌سواری"]
            elif goal == "weight_loss":
                recommendations = ["زومبا", "آئروبیک", "دویدن", "شنا", "طناب زدن"]
            else:  # maintain
                recommendations = ["یوگا", "پیلاتس", "شنا", "پیاده‌روی سریع"]
        else:  # اضافه‌وزن / چاقی
            recommendations = ["پیاده‌روی سریع", "شنا", "آئروبیک کم‌فشار", "دوچرخه‌سواری"]

        return recommendations

    def get_recommended_exercises_for_male(self, bmi: float, goal: str) -> List[str]:
        """
        Get recommended exercises for men based on BMI and goal
        """
        recommendations = []

        if bmi < 18.5:  # کم‌وزن
            recommendations = ["بدنسازی", "وزنه", "کراس‌فیت", "کشتی"]
        elif 18.5 <= bmi < 25:  # نرمال
            if goal == "muscle_gain":
                recommendations = ["بدنسازی", "وزنه", "کراس‌فیت", "شنا"]
            elif goal == "weight_loss":
                recommendations = ["دویدن", "شنا", "فوتبال", "بسکتبال", "طناب زدن"]
            else:  # maintain
                recommendations = ["بدنسازی", "شنا", "دوچرخه‌سواری", "فوتبال"]
        else:  # اضافه‌وزن / چاقی
            recommendations = ["پیاده‌روی سریع", "شنا", "دوچرخه‌سواری", "بدنسازی"]

        return recommendations

    def get_all_exercises(self) -> List[Dict]:
        """
        Get list of all available exercises with MET values
        """
        exercises = []
        for exercise_name, met_value in self.EXERCISE_MET_VALUES.items():
            exercises.append({
                "name": exercise_name,
                "met_value": met_value,
                "category": self._get_exercise_category(exercise_name)
            })
        return exercises

    def _get_exercise_category(self, exercise_name: str) -> str:
        """
        Categorize exercise
        """
        cardio = ["دویدن", "پیاده‌روی سریع", "پیاده‌روی آرام", "دوچرخه‌سواری", "شنا", "طناب زدن"]
        strength = ["بدنسازی", "وزنه", "کراس‌فیت"]
        flexibility = ["پیلاتس", "یوگا"]
        group = ["آئروبیک", "زومبا"]
        sports = ["فوتبال", "بسکتبال", "والیبال", "تنیس"]

        if exercise_name in cardio:
            return "کاردیو"
        elif exercise_name in strength:
            return "قدرتی"
        elif exercise_name in flexibility:
            return "انعطاف‌پذیری"
        elif exercise_name in group:
            return "گروهی"
        elif exercise_name in sports:
            return "ورزشی"
        else:
            return "سایر"


# Singleton instance
exercise_service = ExerciseService()
