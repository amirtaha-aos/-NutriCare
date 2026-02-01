const express = require('express');
const router = express.Router();
const exerciseAnalysisController = require('../controllers/exerciseAnalysis.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/exercises', exerciseAnalysisController.getExercises);
router.get('/guidance/:exerciseType', exerciseAnalysisController.getGuidance);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/analyze-form', exerciseAnalysisController.analyzeForm);
router.post('/analyze-set', exerciseAnalysisController.analyzeSet);
router.post('/detect-rep', exerciseAnalysisController.detectRep);
router.post('/analyze-position', exerciseAnalysisController.analyzePosition);
router.post('/analyze-rep', exerciseAnalysisController.analyzeRep);
router.post('/reset-session', exerciseAnalysisController.resetSession);
router.post('/save-workout', exerciseAnalysisController.saveWorkout);
router.get('/workout-history', exerciseAnalysisController.getWorkoutHistory);

module.exports = router;
