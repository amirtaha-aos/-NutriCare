const Meal = require('../models/Meal');
const Food = require('../models/Food');
const HealthProfile = require('../models/HealthProfile');
const gamificationService = require('../services/gamification.service');

/**
 * Get daily nutrition summary
 * GET /api/meals/daily?date=YYYY-MM-DD
 */
exports.getDailySummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all meals for the day
    const meals = await Meal.find({
      userId,
      consumedAt: { $gte: targetDate, $lte: endOfDay }
    }).sort({ consumedAt: 1 });

    // Get user's health profile for goals
    const healthProfile = await HealthProfile.findOne({ userId });

    // Default goals
    const goals = {
      calories: healthProfile?.dailyCalorieGoal || 2000,
      protein: healthProfile?.proteinGoal || 50,
      carbs: healthProfile?.carbsGoal || 250,
      fats: healthProfile?.fatsGoal || 65,
      fiber: 25,
      sugar: 50,
      sodium: 2300
    };

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    meals.forEach(meal => {
      totals.calories += meal.totalNutrition?.calories || 0;
      totals.protein += meal.totalNutrition?.protein || 0;
      totals.carbs += meal.totalNutrition?.carbs || 0;
      totals.fats += meal.totalNutrition?.fats || 0;
      totals.fiber += meal.totalNutrition?.fiber || 0;
      totals.sugar += meal.totalNutrition?.sugar || 0;
      totals.sodium += meal.totalNutrition?.sodium || 0;

      if (mealsByType[meal.mealType]) {
        mealsByType[meal.mealType].push(meal);
      }
    });

    // Round totals
    Object.keys(totals).forEach(key => {
      totals[key] = Math.round(totals[key] * 10) / 10;
    });

    // Calculate percentages
    const percentages = {
      calories: Math.round((totals.calories / goals.calories) * 100),
      protein: Math.round((totals.protein / goals.protein) * 100),
      carbs: Math.round((totals.carbs / goals.carbs) * 100),
      fats: Math.round((totals.fats / goals.fats) * 100)
    };

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        meals,
        mealsByType,
        totals,
        goals,
        percentages,
        mealsCount: meals.length
      }
    });
  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get meal history
 * GET /api/meals/history?startDate=...&endDate=...
 */
exports.getMealHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit = 50 } = req.query;

    const query = { userId };

    if (startDate) {
      query.consumedAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      query.consumedAt = { ...query.consumedAt, $lte: new Date(endDate) };
    }

    const meals = await Meal.find(query)
      .sort({ consumedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    console.error('Error getting meal history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add a meal entry
 * POST /api/meals
 */
exports.addMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { foodId, servings = 1, mealType, consumedAt, customFood } = req.body;

    let foodItem;

    if (foodId) {
      // Get food from database
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({
          success: false,
          message: 'Food not found'
        });
      }

      // Calculate nutrition based on servings
      const servingGrams = food.servingSize?.amount || 100;
      const totalGrams = servingGrams * servings;
      const multiplier = totalGrams / 100;

      foodItem = {
        name: food.name,
        portionSize: `${servings} serving${servings > 1 ? 's' : ''}`,
        portionGrams: totalGrams,
        calories: Math.round(food.nutritionPer100g.calories * multiplier),
        protein: Math.round(food.nutritionPer100g.protein * multiplier * 10) / 10,
        carbs: Math.round(food.nutritionPer100g.carbs * multiplier * 10) / 10,
        fats: Math.round(food.nutritionPer100g.fats * multiplier * 10) / 10,
        fiber: Math.round((food.nutritionPer100g.fiber || 0) * multiplier * 10) / 10,
        sugar: Math.round((food.nutritionPer100g.sugar || 0) * multiplier * 10) / 10,
        sodium: Math.round((food.nutritionPer100g.sodium || 0) * multiplier)
      };
    } else if (customFood) {
      // Custom food entry
      foodItem = {
        name: customFood.name,
        portionSize: customFood.portionSize || '1 serving',
        portionGrams: customFood.portionGrams || 100,
        calories: customFood.calories || 0,
        protein: customFood.protein || 0,
        carbs: customFood.carbs || 0,
        fats: customFood.fats || 0,
        fiber: customFood.fiber || 0,
        sugar: customFood.sugar || 0,
        sodium: customFood.sodium || 0
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either foodId or customFood is required'
      });
    }

    // Create meal
    const meal = await Meal.create({
      userId,
      mealType: mealType || 'snack',
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
      foodItems: [foodItem],
      isManualEntry: true
    });

    // Award XP for logging meal
    try {
      await gamificationService.awardXp(userId, 10, 'meal_logged');
    } catch (xpError) {
      console.log('XP award skipped:', xpError.message);
    }

    res.status(201).json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update a meal
 * PUT /api/meals/:mealId
 */
exports.updateMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { mealId } = req.params;
    const { servings, mealType, consumedAt } = req.body;

    const meal = await Meal.findOne({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    if (servings && meal.foodItems.length > 0) {
      // Recalculate nutrition based on new servings
      const originalServing = meal.foodItems[0].portionGrams || 100;
      const newGrams = originalServing * servings;
      const multiplier = servings;

      meal.foodItems[0].portionGrams = newGrams;
      meal.foodItems[0].calories = Math.round(meal.foodItems[0].calories * multiplier);
      meal.foodItems[0].protein = Math.round(meal.foodItems[0].protein * multiplier * 10) / 10;
      meal.foodItems[0].carbs = Math.round(meal.foodItems[0].carbs * multiplier * 10) / 10;
      meal.foodItems[0].fats = Math.round(meal.foodItems[0].fats * multiplier * 10) / 10;
    }

    if (mealType) meal.mealType = mealType;
    if (consumedAt) meal.consumedAt = new Date(consumedAt);

    await meal.save();

    res.json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a meal
 * DELETE /api/meals/:mealId
 */
exports.deleteMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { mealId } = req.params;

    const meal = await Meal.findOneAndDelete({ _id: mealId, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
