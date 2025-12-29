const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Meal = require('../models/Meal');

// Get today's meals
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: today }
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get meals by date
router.get('/date/:date', protect, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: date, $lt: nextDay }
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add a meal
router.post('/', protect, async (req, res) => {
  try {
    const { mealType, name, calories, protein, carbs, fat, fiber, items, notes } = req.body;

    const meal = await Meal.create({
      user: req.user.id,
      mealType,
      name,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      items: items || [],
      notes
    });

    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a meal
router.put('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    const { mealType, name, calories, protein, carbs, fat, fiber, items, notes } = req.body;

    meal.mealType = mealType || meal.mealType;
    meal.name = name || meal.name;
    meal.calories = calories !== undefined ? calories : meal.calories;
    meal.protein = protein !== undefined ? protein : meal.protein;
    meal.carbs = carbs !== undefined ? carbs : meal.carbs;
    meal.fat = fat !== undefined ? fat : meal.fat;
    meal.fiber = fiber !== undefined ? fiber : meal.fiber;
    meal.items = items || meal.items;
    meal.notes = notes !== undefined ? notes : meal.notes;

    await meal.save();

    res.json({ success: true, data: meal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a meal
router.delete('/:id', protect, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get weekly summary
router.get('/summary/week', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: weekAgo, $lte: today }
    });

    // Group by day
    const dailySummary = {};
    meals.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      }
      dailySummary[dateKey].calories += meal.calories || 0;
      dailySummary[dateKey].protein += meal.protein || 0;
      dailySummary[dateKey].carbs += meal.carbs || 0;
      dailySummary[dateKey].fat += meal.fat || 0;
      dailySummary[dateKey].meals += 1;
    });

    res.json({ success: true, data: dailySummary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quick add common foods
router.get('/foods/common', protect, async (req, res) => {
  const commonFoods = [
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Rice (1 cup cooked)', calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
    { name: 'Egg (1 large)', calories: 72, protein: 6, carbs: 0.4, fat: 5 },
    { name: 'Banana (medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Apple (medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
    { name: 'Bread (1 slice)', calories: 79, protein: 2.7, carbs: 15, fat: 1 },
    { name: 'Milk (1 cup)', calories: 149, protein: 8, carbs: 12, fat: 8 },
    { name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
    { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: 'Broccoli (1 cup)', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
    { name: 'Oatmeal (1 cup cooked)', calories: 158, protein: 6, carbs: 27, fat: 3.2 },
    { name: 'Avocado (half)', calories: 160, protein: 2, carbs: 9, fat: 15 },
    { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Sweet Potato (medium)', calories: 103, protein: 2.3, carbs: 24, fat: 0.1 },
    { name: 'Pasta (1 cup cooked)', calories: 220, protein: 8, carbs: 43, fat: 1.3 }
  ];

  res.json({ success: true, data: commonFoods });
});

module.exports = router;
