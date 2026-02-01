const express = require('express');
const router = express.Router();
const foodsController = require('../controllers/foods.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Search foods (public)
router.get('/search', foodsController.searchFoods);

// Get food by ID
router.get('/:foodId', foodsController.getFoodById);

// Get food by barcode
router.get('/barcode/:barcode', foodsController.getFoodByBarcode);

module.exports = router;
