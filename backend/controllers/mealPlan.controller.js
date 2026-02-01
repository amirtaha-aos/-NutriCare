const MealPlan = require('../models/MealPlan');
const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const openaiService = require('../services/openai.service');
const pdfService = require('../services/pdf.service');

/**
 * Generate AI meal plan
 * POST /api/meal-plan/generate
 */
exports.generateMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, duration = 7, budget, location, preferences } = req.body;

    if (!budget || budget <= 0) {
      return res.status(400).json({ success: false, message: 'Valid budget is required' });
    }

    // Get user's health profile with full medical data
    const healthProfile = await HealthProfile.findOne({ userId });
    const user = await User.findById(userId);

    // Build comprehensive user context including diseases, medications, and lab results
    const userContext = {
      healthProfile: {
        diseases: healthProfile?.diseases || [],
        medications: healthProfile?.medications || [],
        allergies: healthProfile?.allergies || [],
        labTests: healthProfile?.labTests || [],
        bmi: healthProfile?.bmi,
        bmr: healthProfile?.bmr,
        tdee: healthProfile?.tdee,
      },
      weight: user?.weight,
      height: user?.height,
      age: user?.age,
      gender: user?.gender,
      goals: user?.goals || {},
      tdee: healthProfile?.tdee,
      budget,
      location: location || 'Iran',
      duration,
      preferences: {
        ...preferences,
        location: { city: location || 'Iran' }
      },
    };

    // Generate medically-appropriate meal plan using AI
    const aiResponse = await openaiService.generateMealPlan(userContext, {
      duration,
      budget,
      location: location || 'Iran',
      preferences: preferences || {},
      days: duration,
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate meal plan',
        error: aiResponse.error,
      });
    }

    const aiMealPlan = aiResponse.mealPlan;

    // Calculate nutrition summary
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let dayCount = 0;

    (aiMealPlan.meals || []).forEach((dailyMeal) => {
      if (dailyMeal.totalCalories) {
        totalCalories += dailyMeal.totalCalories;
        totalProtein += dailyMeal.totalProtein || 0;
        totalCarbs += dailyMeal.totalCarbs || 0;
        totalFat += dailyMeal.totalFat || 0;
        dayCount++;
      }
    });

    const nutritionSummary = {
      avgDailyCalories: dayCount > 0 ? totalCalories / dayCount : 0,
      avgDailyProtein: dayCount > 0 ? totalProtein / dayCount : 0,
      avgDailyCarbs: dayCount > 0 ? totalCarbs / dayCount : 0,
      avgDailyFat: dayCount > 0 ? totalFat / dayCount : 0,
    };

    // Save meal plan to database
    const mealPlan = await MealPlan.create({
      userId,
      title: title || `${duration}-Day Meal Plan`,
      duration,
      budget,
      location: location || 'Iran',
      preferences: preferences || {},
      meals: aiMealPlan.meals || [],
      shoppingList: aiMealPlan.shoppingList || [],
      totalEstimatedCost: aiMealPlan.totalEstimatedCost || 0,
      nutritionSummary,
      isActive: false,
    });

    res.status(201).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate meal plan' });
  }
};

/**
 * Get all meal plans for user
 * GET /api/meal-plan
 */
exports.getMealPlans = async (req, res) => {
  try {
    const userId = req.userId;

    const mealPlans = await MealPlan.find({ userId })
      .sort({ createdAt: -1 })
      .select('-meals.breakfast.instructions -meals.lunch.instructions -meals.dinner.instructions')
      .limit(20);

    res.json({
      success: true,
      data: mealPlans,
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ success: false, message: 'Failed to get meal plans' });
  }
};

/**
 * Get single meal plan by ID
 * GET /api/meal-plan/:id
 */
exports.getMealPlanById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const mealPlan = await MealPlan.findOne({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    res.json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to get meal plan' });
  }
};

/**
 * Activate meal plan
 * POST /api/meal-plan/:id/activate
 */
exports.activateMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Deactivate all other meal plans
    await MealPlan.updateMany({ userId, isActive: true }, { isActive: false });

    // Activate selected meal plan
    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: id, userId },
      { isActive: true, activatedAt: new Date() },
      { new: true }
    );

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    res.json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error('Activate meal plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to activate meal plan' });
  }
};

/**
 * Get shopping list for meal plan
 * GET /api/meal-plan/:id/shopping-list
 */
exports.getShoppingList = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const mealPlan = await MealPlan.findOne({ _id: id, userId }).select('shoppingList totalEstimatedCost');

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    res.json({
      success: true,
      data: {
        shoppingList: mealPlan.shoppingList,
        totalEstimatedCost: mealPlan.totalEstimatedCost,
      },
    });
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ success: false, message: 'Failed to get shopping list' });
  }
};

/**
 * Export meal plan as PDF
 * GET /api/meal-plan/:id/export-pdf
 */
exports.exportMealPlanPDF = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const mealPlan = await MealPlan.findOne({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    // Get user profile for PDF header
    const healthProfile = await HealthProfile.findOne({ userId });

    // Generate PDF
    const pdfBuffer = await pdfService.generateMealPlanPDF(mealPlan, healthProfile);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="meal-plan-${mealPlan.title.replace(/\s+/g, '-')}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to export PDF' });
  }
};

/**
 * Delete meal plan
 * DELETE /api/meal-plan/:id
 */
exports.deleteMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const mealPlan = await MealPlan.findOneAndDelete({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ success: false, message: 'Meal plan not found' });
    }

    res.json({
      success: true,
      message: 'Meal plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete meal plan' });
  }
};

module.exports = exports;
