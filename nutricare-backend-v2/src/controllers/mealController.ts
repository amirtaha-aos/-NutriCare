import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Meal from '../models/Meal';
import { startOfDay, endOfDay } from 'date-fns';

// @desc    Get meals for today
// @route   GET /api/v2/meals/today
// @access  Private
export const getTodayMeals = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const meals = await Meal.find({
      userId: req.user?._id,
      date: {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      },
    }).sort({ createdAt: -1 });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    res.json({
      success: true,
      data: {
        meals,
        summary: {
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get meals by date
// @route   GET /api/v2/meals/date/:date
// @access  Private
export const getMealsByDate = async (req: AuthRequest, res: Response) => {
  try {
    const date = new Date(req.params.date);
    const meals = await Meal.find({
      userId: req.user?._id,
      date: {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: meals,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a meal
// @route   POST /api/v2/meals
// @access  Private
export const addMeal = async (req: AuthRequest, res: Response) => {
  try {
    const mealData = {
      ...req.body,
      userId: req.user?._id,
      syncStatus: 'synced',
    };

    const meal = await Meal.create(mealData);

    res.status(201).json({
      success: true,
      data: meal,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a meal
// @route   PUT /api/v2/meals/:id
// @access  Private
export const updateMeal = async (req: AuthRequest, res: Response) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    res.json({
      success: true,
      data: meal,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/v2/meals/:id
// @access  Private
export const deleteMeal = async (req: AuthRequest, res: Response) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?._id,
    });

    if (!meal) {
      return res.status(404).json({ success: false, error: 'Meal not found' });
    }

    res.json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get common foods
// @route   GET /api/v2/meals/common-foods
// @access  Private
export const getCommonFoods = async (req: AuthRequest, res: Response) => {
  try {
    const commonFoods = [
      { name: 'برنج سفید', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: '100g' },
      { name: 'مرغ گریل', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
      { name: 'تخم مرغ', calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: '1 عدد' },
      { name: 'نان سنگک', calories: 270, protein: 9, carbs: 56, fat: 1, portion: '100g' },
      { name: 'ماست کم چرب', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, portion: '100g' },
      { name: 'سیب', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: '1 عدد متوسط' },
      { name: 'موز', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: '1 عدد متوسط' },
      { name: 'گوشت قرمز', calories: 250, protein: 26, carbs: 0, fat: 15, portion: '100g' },
      { name: 'ماهی', calories: 206, protein: 22, carbs: 0, fat: 12, portion: '100g' },
      { name: 'سبزیجات', calories: 25, protein: 2, carbs: 5, fat: 0.2, portion: '100g' },
    ];

    res.json({
      success: true,
      data: commonFoods,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
