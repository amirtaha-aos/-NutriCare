const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exercise.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/log', exerciseController.logExercise);
router.get('/history', exerciseController.getExerciseHistory);
router.get('/daily-stats', exerciseController.getDailyStats);
router.get('/weekly-stats', exerciseController.getWeeklyStats);
router.delete('/:exerciseId', exerciseController.deleteExercise);

module.exports = router;
