const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth.middleware');
const recommendationController = require('../controllers/recommendationController');

// Health Analysis (requires auth)
router.get('/health-analysis', auth, recommendationController.getHealthAnalysis);

// Medicine Interactions (public - useful for quick checks)
router.post('/medicine-interactions', recommendationController.checkMedicineInteractions);

// Lab Results Interpretation (public)
router.post('/interpret-lab', recommendationController.interpretLabResults);

// Get Suggested Meal Plan (requires auth)
router.get('/suggested-meal-plan', auth, recommendationController.getSuggestedMealPlan);

// Food Search (public)
router.get('/foods', recommendationController.searchFoods);
router.get('/foods/barcode/:barcode', recommendationController.getFoodByBarcode);

// Lab Test Types (public)
router.get('/lab-tests', recommendationController.getLabTestTypes);

// Medicine Search (public)
router.get('/medicines', recommendationController.searchMedicines);

// Predefined Meal Plans (public)
router.get('/meal-plans', recommendationController.getPredefinedMealPlans);

module.exports = router;
