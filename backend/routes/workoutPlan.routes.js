const express = require('express');
const router = express.Router();
const workoutPlanController = require('../controllers/workoutPlan.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/generate', workoutPlanController.generateWorkoutPlan);
router.get('/', workoutPlanController.getWorkoutPlans);
router.get('/active', workoutPlanController.getActivePlan);
router.post('/:planId/activate', workoutPlanController.setActivePlan);

module.exports = router;
