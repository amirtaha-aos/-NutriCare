const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get user profile
router.get('/profile', usersController.getProfile);

// Update user profile
router.put('/profile', usersController.updateProfile);

// Update goals
router.put('/goals', usersController.updateGoals);

module.exports = router;
