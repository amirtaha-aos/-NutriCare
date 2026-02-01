const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlan.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Generate AI meal plan
router.post('/generate', mealPlanController.generateMealPlan);

// Get all meal plans
router.get('/', mealPlanController.getMealPlans);

// Get single meal plan
router.get('/:id', mealPlanController.getMealPlanById);

// Activate meal plan
router.post('/:id/activate', mealPlanController.activateMealPlan);

// Get shopping list
router.get('/:id/shopping-list', mealPlanController.getShoppingList);

// Export PDF
router.get('/:id/export-pdf', mealPlanController.exportMealPlanPDF);

// Delete meal plan
router.delete('/:id', mealPlanController.deleteMealPlan);

module.exports = router;
