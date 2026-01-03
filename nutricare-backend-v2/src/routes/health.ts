import express from 'express';
import {
  getDashboard,
  getTodayHealth,
  updateTodayHealth,
  addWater,
  getWeightHistory,
  logWeight,
} from '../controllers/healthController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/today', protect, getTodayHealth);
router.put('/today', protect, updateTodayHealth);
router.post('/water/add', protect, addWater);
router.get('/weight/history', protect, getWeightHistory);
router.post('/weight', protect, logWeight);

export default router;
