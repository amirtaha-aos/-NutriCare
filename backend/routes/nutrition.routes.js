const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutrition.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { foodScanLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * Nutrition Routes
 * All routes require authentication
 */

// AI-Powered Food Analysis
router.post(
  '/analyze-food',
  authenticateToken,
  foodScanLimiter,
  nutritionController.analyzeFoodImage
);

router.post(
  '/analyze-partial',
  authenticateToken,
  foodScanLimiter,
  nutritionController.analyzePartialConsumption
);

router.post('/scan-barcode', authenticateToken, nutritionController.scanBarcode);

// Meal Logging
router.post('/log-meal', authenticateToken, nutritionController.logMeal);

router.get('/meals', authenticateToken, nutritionController.getMealHistory);

router.put('/meals/:mealId', authenticateToken, nutritionController.updateMeal);

router.delete('/meals/:mealId', authenticateToken, nutritionController.deleteMeal);

// Food Database
router.get('/foods/search', authenticateToken, nutritionController.searchFoods);

// Statistics
router.get('/stats', authenticateToken, nutritionController.getNutritionStats);

module.exports = router;
