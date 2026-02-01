const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: [{
    name: String,
    amount: String,
    category: String, // dairy, meat, vegetables, etc.
  }],
  instructions: String,
  prepTime: Number, // in minutes
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
});

const dailyMealSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
  },
  breakfast: recipeSchema,
  morningSnack: recipeSchema,
  lunch: recipeSchema,
  afternoonSnack: recipeSchema,
  dinner: recipeSchema,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // number of days (1-7)
    required: true,
    default: 7,
  },
  budget: {
    type: Number, // weekly budget in local currency
    required: true,
  },
  location: {
    type: String, // for local food availability
    default: 'Iran',
  },
  preferences: {
    vegetarian: Boolean,
    vegan: Boolean,
    glutenFree: Boolean,
    dairyFree: Boolean,
    halal: Boolean,
  },
  meals: [dailyMealSchema],
  shoppingList: [{
    category: String, // dairy, meat, vegetables, fruits, grains, etc.
    items: [{
      name: String,
      amount: String,
      estimatedCost: Number,
    }],
  }],
  totalEstimatedCost: Number,
  nutritionSummary: {
    avgDailyCalories: Number,
    avgDailyProtein: Number,
    avgDailyCarbs: Number,
    avgDailyFat: Number,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  activatedAt: Date,
});

// Compound index for efficient queries
mealPlanSchema.index({ userId: 1, createdAt: -1 });
mealPlanSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
