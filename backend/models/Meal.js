const mongoose = require('mongoose');

/**
 * Food Item Schema
 * Individual food items within a meal
 */
const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    portionSize: {
      type: String, // e.g., "1 cup", "200g", "1 medium apple"
    },
    portionGrams: {
      type: Number, // Portion size in grams
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fats: {
      type: Number,
      default: 0,
      min: 0,
    },
    fiber: {
      type: Number,
      default: 0,
      min: 0,
    },
    sugar: {
      type: Number,
      default: 0,
      min: 0,
    },
    sodium: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }
);

/**
 * Meal Schema
 * Represents a logged meal with AI analysis
 */
const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    consumedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Food analysis data
    foodItems: [foodItemSchema],
    // Total nutrition for the meal
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
    },
    // AI analysis details
    aiAnalysis: {
      cookingMethod: String,
      oilType: String,
      additives: [String],
      healthWarnings: [String],
      allergenAlerts: [String],
      confidenceScore: Number,
      rawResponse: String, // Store raw AI response for debugging
    },
    // Image data
    imageUrl: {
      type: String, // URL to stored image (S3/Cloudinary)
    },
    imageHash: {
      type: String, // Hash of image for cache lookup
    },
    // Partial consumption tracking
    partialConsumption: {
      isPartial: {
        type: Boolean,
        default: false,
      },
      beforeImageUrl: String,
      afterImageUrl: String,
      percentageConsumed: Number, // 0-100
      actualNutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
      },
      analysisDate: Date,
    },
    // Manual override flag
    isManualEntry: {
      type: Boolean,
      default: false, // false = AI analyzed, true = manually entered
    },
    // Notes
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
mealSchema.index({ userId: 1, consumedAt: -1 }); // Get user's meals sorted by date
mealSchema.index({ userId: 1, mealType: 1, consumedAt: -1 }); // Filter by meal type

// Virtual for day summary
mealSchema.virtual('consumptionDate').get(function () {
  return this.consumedAt.toISOString().split('T')[0];
});

// Pre-save middleware to calculate total nutrition
mealSchema.pre('save', function (next) {
  if (this.foodItems && this.foodItems.length > 0) {
    this.totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    this.foodItems.forEach((item) => {
      this.totalNutrition.calories += item.calories || 0;
      this.totalNutrition.protein += item.protein || 0;
      this.totalNutrition.carbs += item.carbs || 0;
      this.totalNutrition.fats += item.fats || 0;
      this.totalNutrition.fiber += item.fiber || 0;
      this.totalNutrition.sugar += item.sugar || 0;
      this.totalNutrition.sodium += item.sodium || 0;
    });

    // If partial consumption, override with actual consumed amounts
    if (this.partialConsumption?.isPartial && this.partialConsumption.actualNutrition) {
      this.totalNutrition = {
        ...this.totalNutrition,
        ...this.partialConsumption.actualNutrition,
      };
    }
  }
});

// Static method to get daily summary
mealSchema.statics.getDailySummary = async function (userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const meals = await this.find({
    userId,
    consumedAt: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ consumedAt: 1 });

  const summary = {
    date: date.toISOString().split('T')[0],
    meals,
    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
    mealCounts: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    },
  };

  meals.forEach((meal) => {
    summary.totals.calories += meal.totalNutrition.calories;
    summary.totals.protein += meal.totalNutrition.protein;
    summary.totals.carbs += meal.totalNutrition.carbs;
    summary.totals.fats += meal.totalNutrition.fats;
    summary.totals.fiber += meal.totalNutrition.fiber;
    summary.totals.sugar += meal.totalNutrition.sugar;
    summary.totals.sodium += meal.totalNutrition.sodium;

    summary.mealCounts[meal.mealType]++;
  });

  return summary;
};

// Static method to get weekly summary
mealSchema.statics.getWeeklySummary = async function (userId, startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const meals = await this.find({
    userId,
    consumedAt: { $gte: startDate, $lt: endDate },
  }).sort({ consumedAt: 1 });

  const dailySummaries = {};

  meals.forEach((meal) => {
    const day = meal.consumedAt.toISOString().split('T')[0];

    if (!dailySummaries[day]) {
      dailySummaries[day] = {
        date: day,
        totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        mealCount: 0,
      };
    }

    dailySummaries[day].totals.calories += meal.totalNutrition.calories;
    dailySummaries[day].totals.protein += meal.totalNutrition.protein;
    dailySummaries[day].totals.carbs += meal.totalNutrition.carbs;
    dailySummaries[day].totals.fats += meal.totalNutrition.fats;
    dailySummaries[day].mealCount++;
  });

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dailySummaries: Object.values(dailySummaries),
    totalMeals: meals.length,
  };
};

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
