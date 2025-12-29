const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  protein: Number, // گرم
  carbs: Number,   // گرم
  fat: Number,     // گرم
  fiber: Number,   // گرم
  ingredients: [String],
  instructions: String
});

const DayPlanSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  breakfast: MealSchema,
  snack1: MealSchema,
  lunch: MealSchema,
  snack2: MealSchema,
  dinner: MealSchema,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number
});

const NutritionPlanSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  goal: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 'health_improvement'],
    default: 'maintenance'
  },
  dailyCalorieTarget: Number,
  macroTargets: {
    protein: Number,  // درصد
    carbs: Number,    // درصد
    fat: Number       // درصد
  },
  weeklyPlan: [DayPlanSchema],
  // غذاهای مجاز و ممنوع
  allowedFoods: [String],
  restrictedFoods: [String],
  // توصیه‌ها
  recommendations: [String],
  supplements: [{
    name: String,
    dosage: String,
    timing: String
  }],
  // وضعیت
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NutritionPlan', NutritionPlanSchema);
