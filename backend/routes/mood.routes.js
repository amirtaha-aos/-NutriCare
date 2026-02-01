const express = require('express');
const router = express.Router();
const moodController = require('../controllers/mood.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Log mood entry
router.post('/log', moodController.logMood);

// Get mood history
router.get('/history', moodController.getMoodHistory);

// Get mood analytics
router.get('/analytics', moodController.getMoodAnalytics);

// Get today's mood
router.get('/today', moodController.getTodayMood);

// Breathing exercises
router.get('/breathing/exercises', moodController.getBreathingExercises);
router.post('/breathing/log', moodController.logBreathingSession);

module.exports = router;
