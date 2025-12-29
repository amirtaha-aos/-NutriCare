const express = require('express');
const router = express.Router();
const {
  chat,
  analyzeFood,
  analyzeLabTest,
  analyzeDrugs,
  generateMealPlan,
  healthAnalysis
} = require('../controllers/aiController');

// All routes are public (no auth needed)
router.post('/chat', chat);
router.post('/analyze-food', analyzeFood);
router.post('/analyze-lab', analyzeLabTest);
router.post('/analyze-drugs', analyzeDrugs);
router.post('/meal-plan', generateMealPlan);
router.post('/health-analysis', healthAnalysis);

module.exports = router;
