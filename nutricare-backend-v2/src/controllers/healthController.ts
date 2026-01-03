import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import HealthLog from '../models/HealthLog';
import Meal from '../models/Meal';
import { startOfDay, endOfDay, subDays } from 'date-fns';

// @desc    Get dashboard data
// @route   GET /api/v2/health/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const userId = req.user?._id;

    // Get today's health log
    const healthLog = await HealthLog.findOne({
      userId,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    });

    // Get today's meals
    const meals = await Meal.find({
      userId,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

    // Calculate BMI
    let bmi = null;
    if (req.user?.healthData?.weight && req.user?.healthData?.height) {
      const heightM = req.user.healthData.height / 100;
      bmi = parseFloat((req.user.healthData.weight / (heightM * heightM)).toFixed(1));
    }

    res.json({
      success: true,
      data: {
        waterIntake: healthLog?.waterIntake || 0,
        caloriesConsumed: totalCalories,
        proteinConsumed: totalProtein,
        mealCount: meals.length,
        weight: req.user?.healthData?.weight,
        height: req.user?.healthData?.height,
        targetWeight: req.user?.healthData?.targetWeight,
        bmi,
        dailyCalorieGoal: req.user?.healthData?.dailyCalorieGoal || 2000,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get today's health log
// @route   GET /api/v2/health/today
// @access  Private
export const getTodayHealth = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    let healthLog = await HealthLog.findOne({
      userId: req.user?._id,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    });

    if (!healthLog) {
      healthLog = await HealthLog.create({
        userId: req.user?._id,
        date: today,
        waterIntake: 0,
      });
    }

    res.json({
      success: true,
      data: healthLog,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update today's health log
// @route   PUT /api/v2/health/today
// @access  Private
export const updateTodayHealth = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const healthLog = await HealthLog.findOneAndUpdate(
      {
        userId: req.user?._id,
        date: {
          $gte: startOfDay(today),
          $lte: endOfDay(today),
        },
      },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      data: healthLog,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add water intake
// @route   POST /api/v2/health/water/add
// @access  Private
export const addWater = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const { amount = 1 } = req.body;

    const healthLog = await HealthLog.findOneAndUpdate(
      {
        userId: req.user?._id,
        date: {
          $gte: startOfDay(today),
          $lte: endOfDay(today),
        },
      },
      { $inc: { waterIntake: amount } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: healthLog,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get weight history
// @route   GET /api/v2/health/weight/history
// @access  Private
export const getWeightHistory = async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = subDays(new Date(), days);

    const logs = await HealthLog.find({
      userId: req.user?._id,
      date: { $gte: startDate },
      weight: { $exists: true, $ne: null },
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: logs.map(log => ({
        date: log.date,
        weight: log.weight,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Log weight
// @route   POST /api/v2/health/weight
// @access  Private
export const logWeight = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const { weight, notes } = req.body;

    const healthLog = await HealthLog.findOneAndUpdate(
      {
        userId: req.user?._id,
        date: {
          $gte: startOfDay(today),
          $lte: endOfDay(today),
        },
      },
      { weight, notes },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: healthLog,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
