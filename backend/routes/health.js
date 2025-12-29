const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const HealthLog = require('../models/HealthLog');
const WeightLog = require('../models/WeightLog');
const Meal = require('../models/Meal');
const User = require('../models/User');

// Get today's health log
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let log = await HealthLog.findOne({
      user: req.user.id,
      date: { $gte: today }
    });

    if (!log) {
      log = await HealthLog.create({
        user: req.user.id,
        date: today
      });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update today's health log
router.put('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { waterIntake, steps, sleepHours, mood, notes } = req.body;

    let log = await HealthLog.findOneAndUpdate(
      { user: req.user.id, date: { $gte: today } },
      { waterIntake, steps, sleepHours, mood, notes },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add water
router.post('/water', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { amount } = req.body; // amount in glasses (1 glass = 250ml)

    let log = await HealthLog.findOneAndUpdate(
      { user: req.user.id, date: { $gte: today } },
      { $inc: { waterIntake: amount || 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Cap at 20 glasses
    if (log.waterIntake > 20) {
      log.waterIntake = 20;
      await log.save();
    }

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Set water intake directly
router.put('/water', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { waterIntake } = req.body;

    let log = await HealthLog.findOneAndUpdate(
      { user: req.user.id, date: { $gte: today } },
      { waterIntake: Math.min(waterIntake, 20) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Log weight
router.post('/weight', protect, async (req, res) => {
  try {
    const { weight, notes } = req.body;

    const log = await WeightLog.create({
      user: req.user.id,
      weight,
      notes
    });

    // Update user's current weight
    await User.findByIdAndUpdate(req.user.id, {
      'healthData.weight': weight
    });

    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get weight history
router.get('/weight/history', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await WeightLog.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user health profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { weight, height, targetWeight, birthDate, gender, activityLevel, dailyCalorieGoal } = req.body;

    const updateData = {};
    if (weight !== undefined) updateData['healthData.weight'] = weight;
    if (height !== undefined) updateData['healthData.height'] = height;
    if (targetWeight !== undefined) updateData['healthData.targetWeight'] = targetWeight;
    if (birthDate !== undefined) updateData['healthData.birthDate'] = birthDate;
    if (gender !== undefined) updateData['healthData.gender'] = gender;
    if (activityLevel !== undefined) updateData['healthData.activityLevel'] = activityLevel;
    if (dailyCalorieGoal !== undefined) updateData['healthData.dailyCalorieGoal'] = dailyCalorieGoal;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get dashboard summary
router.get('/dashboard', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user with health data
    const user = await User.findById(req.user.id);

    // Get today's health log
    let healthLog = await HealthLog.findOne({
      user: req.user.id,
      date: { $gte: today }
    });

    if (!healthLog) {
      healthLog = { waterIntake: 0, steps: 0, sleepHours: 0 };
    }

    // Get today's meals
    const todayMeals = await Meal.find({
      user: req.user.id,
      date: { $gte: today }
    });

    // Calculate today's nutrition
    const todayNutrition = todayMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Get weight history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weightHistory = await WeightLog.find({
      user: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Calculate daily calorie goal if not set
    let dailyCalorieGoal = user.healthData?.dailyCalorieGoal;
    if (!dailyCalorieGoal && user.healthData?.weight && user.healthData?.height) {
      // Basic BMR calculation (Mifflin-St Jeor)
      const weight = user.healthData.weight;
      const height = user.healthData.height;
      const age = user.healthData?.birthDate
        ? Math.floor((new Date() - new Date(user.healthData.birthDate)) / 31557600000)
        : 30;
      const isMale = user.healthData?.gender === 'male';

      const bmr = isMale
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

      // Activity multiplier
      const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      const multiplier = multipliers[user.healthData?.activityLevel] || 1.55;
      dailyCalorieGoal = Math.round(bmr * multiplier);
    }

    res.json({
      success: true,
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          healthData: user.healthData
        },
        today: {
          ...healthLog._doc || healthLog,
          nutrition: todayNutrition,
          meals: todayMeals
        },
        goals: {
          dailyCalories: dailyCalorieGoal || 2000,
          waterGoal: 8,
          stepsGoal: 10000
        },
        weightHistory
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
