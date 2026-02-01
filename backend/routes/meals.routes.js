const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/meals.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get daily nutrition summary
router.get('/daily', mealsController.getDailySummary);

// Get meal history
router.get('/history', mealsController.getMealHistory);

// Add meal entry
router.post('/', mealsController.addMeal);

// Update meal
router.put('/:mealId', mealsController.updateMeal);

// Delete meal
router.delete('/:mealId', mealsController.deleteMeal);

module.exports = router;
