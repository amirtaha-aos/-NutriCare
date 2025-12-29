const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getWeightHistory,
  getDashboardStats,
  getAllPatients
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/weight-history', getWeightHistory);
router.get('/dashboard', getDashboardStats);

// فقط برای متخصصین
router.get('/', authorize('nutritionist', 'admin'), getAllPatients);

module.exports = router;
