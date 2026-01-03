import express from 'express';
import {
  getTodayMeals,
  getMealsByDate,
  addMeal,
  updateMeal,
  deleteMeal,
  getCommonFoods,
} from '../controllers/mealController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/today', protect, getTodayMeals);
router.get('/date/:date', protect, getMealsByDate);
router.post('/', protect, addMeal);
router.put('/:id', protect, updateMeal);
router.delete('/:id', protect, deleteMeal);
router.get('/common-foods', protect, getCommonFoods);

export default router;
