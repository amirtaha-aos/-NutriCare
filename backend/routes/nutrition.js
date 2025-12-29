const express = require('express');
const router = express.Router();
const {
  createPlan,
  getMyPlans,
  getActivePlan,
  logFood,
  getDailyLog,
  getWeeklyStats,
  searchFood
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

router.use(protect);

// برنامه‌های تغذیه
router.post('/plans', createPlan);
router.get('/plans', getMyPlans);
router.get('/plans/active', getActivePlan);

// لاگ غذا
router.post('/food-log', logFood);
router.get('/food-log/daily', getDailyLog);
router.get('/food-log/weekly', getWeeklyStats);

// جستجوی غذا
router.get('/foods/search', searchFood);

module.exports = router;
