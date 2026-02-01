const crypto = require('crypto');
const openaiService = require('../services/openai.service');
const aiCache = require('../services/aiCache.service');
const Meal = require('../models/Meal');
const Food = require('../models/Food');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');

/**
 * Nutrition Controller
 * Handles AI-powered food analysis, meal logging, and nutrition tracking
 */

/**
 * Analyze food image with AI
 * POST /api/nutrition/analyze-food
 */
exports.analyzeFoodImage = async (req, res) => {
  try {
    const { imageBase64, mealType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required',
      });
    }

    // Get user context for personalized analysis
    const user = await User.findById(req.userId).select('-password');
    const healthProfile = await HealthProfile.findOne({ userId: req.userId });

    const userContext = {
      language: user?.preferences?.language || 'en',
      healthConditions: healthProfile?.diseases?.map((d) => d.name) || [],
      allergies: healthProfile?.allergies || [],
    };

    // Generate image hash for caching
    const imageHash = crypto.createHash('md5').update(imageBase64).digest('hex');

    // Check cache first
    let analysis = aiCache.getFoodAnalysis(imageHash, userContext);

    if (!analysis) {
      console.log('Cache miss - calling OpenAI API...');

      // Call OpenAI API
      const result = await openaiService.analyzeFoodImage(imageBase64, userContext);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'AI analysis failed',
          error: result.error,
        });
      }

      analysis = result.analysis;

      // Cache the result
      aiCache.setFoodAnalysis(imageHash, userContext, analysis);

      console.log(`OpenAI tokens used: ${result.tokensUsed}`);
    } else {
      console.log('Cache hit - using cached analysis');
    }

    // Optionally save as meal log if mealType provided
    let savedMeal = null;
    if (mealType) {
      savedMeal = await Meal.create({
        userId: req.userId,
        mealType,
        foodItems: analysis.foodItems,
        totalNutrition: analysis.totalNutrition,
        aiAnalysis: {
          cookingMethod: analysis.cookingMethod,
          oilType: analysis.oilType,
          additives: analysis.additives,
          healthWarnings: analysis.healthWarnings,
          allergenAlerts: analysis.allergenAlerts,
          confidenceScore: analysis.confidenceScore,
        },
        imageHash,
        isManualEntry: false,
      });
    }

    res.json({
      success: true,
      analysis,
      meal: savedMeal,
      cached: !!analysis.fromCache,
    });
  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze food',
      error: error.message,
    });
  }
};

/**
 * Analyze partial consumption (before/after photos)
 * POST /api/nutrition/analyze-partial
 */
exports.analyzePartialConsumption = async (req, res) => {
  try {
    const { mealId, afterImageBase64 } = req.body;

    if (!mealId || !afterImageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Meal ID and after image are required',
      });
    }

    // Get the original meal
    const meal = await Meal.findOne({ _id: mealId, userId: req.userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    // Get user context
    const user = await User.findById(req.userId).select('-password');
    const userContext = {
      language: user?.preferences?.language || 'en',
    };

    // Prepare before image (we need to store original images for this feature)
    // For now, we'll assume we have the before image hash
    // In production, you'd store actual images in S3/Cloudinary

    const originalAnalysis = {
      foodItems: meal.foodItems,
      totalNutrition: meal.totalNutrition,
    };

    // For demo purposes, we'll use a placeholder
    // In production: fetch beforeImageBase64 from storage using meal.imageUrl
    const beforeImageBase64 = ''; // Fetch from S3/Cloudinary

    // Call OpenAI for consumption analysis
    const result = await openaiService.calculatePartialConsumption(
      beforeImageBase64,
      afterImageBase64,
      originalAnalysis,
      userContext
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Consumption analysis failed',
        error: result.error,
      });
    }

    const consumptionAnalysis = result.analysis;

    // Update meal with partial consumption data
    meal.partialConsumption = {
      isPartial: true,
      afterImageUrl: '', // Store in S3 and save URL
      percentageConsumed:
        consumptionAnalysis.consumptionAnalysis.reduce(
          (sum, item) => sum + item.percentageConsumed,
          0
        ) / consumptionAnalysis.consumptionAnalysis.length,
      actualNutrition: consumptionAnalysis.totalConsumed,
      analysisDate: new Date(),
    };

    await meal.save();

    res.json({
      success: true,
      consumptionAnalysis,
      updatedMeal: meal,
    });
  } catch (error) {
    console.error('Partial consumption analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze consumption',
      error: error.message,
    });
  }
};

/**
 * Scan barcode and get food info
 * POST /api/nutrition/scan-barcode
 */
exports.scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required',
      });
    }

    // Look up food in database
    const food = await Food.findByBarcode(barcode);

    if (food) {
      return res.json({
        success: true,
        food,
        source: 'database',
      });
    }

    // If not found, could integrate with external API (Open Food Facts, etc.)
    // For now, return not found
    res.status(404).json({
      success: false,
      message: 'Food not found in database',
      suggestion: 'Try scanning the food image instead',
    });
  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Barcode scan failed',
      error: error.message,
    });
  }
};

/**
 * Log meal manually
 * POST /api/nutrition/log-meal
 */
exports.logMeal = async (req, res) => {
  try {
    const { mealType, foodItems, notes } = req.body;

    if (!mealType || !foodItems || foodItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Meal type and food items are required',
      });
    }

    const meal = await Meal.create({
      userId: req.userId,
      mealType,
      foodItems,
      notes,
      isManualEntry: true,
    });

    res.status(201).json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error('Meal logging error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log meal',
      error: error.message,
    });
  }
};

/**
 * Get meal history
 * GET /api/nutrition/meals?date=YYYY-MM-DD&period=day|week
 */
exports.getMealHistory = async (req, res) => {
  try {
    const { date, period = 'day' } = req.query;

    const targetDate = date ? new Date(date) : new Date();

    if (period === 'day') {
      const summary = await Meal.getDailySummary(req.userId, targetDate);
      return res.json({
        success: true,
        summary,
      });
    }

    if (period === 'week') {
      const summary = await Meal.getWeeklySummary(req.userId, targetDate);
      return res.json({
        success: true,
        summary,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid period. Use "day" or "week"',
    });
  } catch (error) {
    console.error('Meal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get meal history',
      error: error.message,
    });
  }
};

/**
 * Update meal
 * PUT /api/nutrition/meals/:mealId
 */
exports.updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const updates = req.body;

    const meal = await Meal.findOneAndUpdate(
      { _id: mealId, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    res.json({
      success: true,
      meal,
    });
  } catch (error) {
    console.error('Meal update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal',
      error: error.message,
    });
  }
};

/**
 * Delete meal
 * DELETE /api/nutrition/meals/:mealId
 */
exports.deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await Meal.findOneAndDelete({
      _id: mealId,
      userId: req.userId,
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (error) {
    console.error('Meal deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal',
      error: error.message,
    });
  }
};

/**
 * Search foods
 * GET /api/nutrition/foods/search?q=query&language=en
 */
exports.searchFoods = async (req, res) => {
  try {
    const { q, language = 'en' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const foods = await Food.searchByName(q, language);

    res.json({
      success: true,
      foods,
      count: foods.length,
    });
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
};

/**
 * Get nutrition statistics
 * GET /api/nutrition/stats?period=week|month
 */
exports.getNutritionStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    const days = period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const meals = await Meal.find({
      userId: req.userId,
      consumedAt: { $gte: startDate },
    }).sort({ consumedAt: 1 });

    // Calculate daily averages
    const dailyData = {};

    meals.forEach((meal) => {
      const day = meal.consumedAt.toISOString().split('T')[0];

      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealCount: 0,
        };
      }

      dailyData[day].calories += meal.totalNutrition.calories;
      dailyData[day].protein += meal.totalNutrition.protein;
      dailyData[day].carbs += meal.totalNutrition.carbs;
      dailyData[day].fats += meal.totalNutrition.fats;
      dailyData[day].mealCount++;
    });

    const dailyArray = Object.values(dailyData);

    // Calculate averages
    const totalDays = dailyArray.length || 1;
    const averages = {
      calories: Math.round(
        dailyArray.reduce((sum, day) => sum + day.calories, 0) / totalDays
      ),
      protein: Math.round(
        dailyArray.reduce((sum, day) => sum + day.protein, 0) / totalDays
      ),
      carbs: Math.round(dailyArray.reduce((sum, day) => sum + day.carbs, 0) / totalDays),
      fats: Math.round(dailyArray.reduce((sum, day) => sum + day.fats, 0) / totalDays),
    };

    res.json({
      success: true,
      period,
      dailyData: dailyArray,
      averages,
      totalMeals: meals.length,
    });
  } catch (error) {
    console.error('Nutrition stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nutrition statistics',
      error: error.message,
    });
  }
};
