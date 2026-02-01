const mongoose = require('mongoose');

/**
 * Predefined Meal Plan Schema
 * Pre-built meal plans for specific health conditions
 */
const mealItemSchema = new mongoose.Schema({
  name: String,
  nameFa: String,
  portion: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  notes: String,
});

const dayPlanSchema = new mongoose.Schema({
  day: Number,
  breakfast: [mealItemSchema],
  morningSnack: [mealItemSchema],
  lunch: [mealItemSchema],
  afternoonSnack: [mealItemSchema],
  dinner: [mealItemSchema],
  eveningSnack: [mealItemSchema],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
});

const predefinedMealPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameFa: String,
    description: String,
    descriptionFa: String,
    // Target conditions this plan is for
    targetConditions: [
      {
        type: String,
        enum: [
          'diabetes_type1',
          'diabetes_type2',
          'prediabetes',
          'high_cholesterol',
          'high_blood_pressure',
          'heart_disease',
          'kidney_disease',
          'fatty_liver',
          'iron_deficiency',
          'vitamin_d_deficiency',
          'hypothyroid',
          'hyperthyroid',
          'gout',
          'obesity',
          'underweight',
          'general_healthy',
          'muscle_building',
          'weight_loss',
          'pregnancy',
          'lactation',
        ],
      },
    ],
    // Lab result triggers
    labTriggers: [
      {
        testName: String,
        condition: {
          type: String,
          enum: ['low', 'high', 'very_high', 'very_low'],
        },
      },
    ],
    // Medicine compatibility
    compatibleMedicines: [String],
    incompatibleMedicines: [String],
    // Nutritional goals
    nutritionGoals: {
      dailyCalories: {
        min: Number,
        max: Number,
      },
      proteinPercentage: Number,
      carbsPercentage: Number,
      fatsPercentage: Number,
      sodiumLimit: Number,
      sugarLimit: Number,
      fiberMin: Number,
    },
    // Foods to avoid
    avoidFoods: [String],
    avoidFoodsFa: [String],
    // Foods to include
    includeFoods: [String],
    includeFoodsFa: [String],
    // The actual meal plan
    days: [dayPlanSchema],
    duration: {
      type: Number,
      default: 7,
    },
    // Priority for matching (higher = more specific)
    priority: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

predefinedMealPlanSchema.index({ targetConditions: 1 });
predefinedMealPlanSchema.index({ 'labTriggers.testName': 1 });

const PredefinedMealPlan = mongoose.model('PredefinedMealPlan', predefinedMealPlanSchema);

module.exports = PredefinedMealPlan;
