import express from 'express';
import {
  chat,
  analyzeFood,
  analyzeLabTest,
  analyzeMedications,
  generateMealPlan,
  healthAnalysis,
} from '../controllers/aiController';

const router = express.Router();

// همه endpoints AI عمومی هستند (بدون نیاز به authentication)
router.post('/chat', chat);
router.post('/analyze-food', analyzeFood);
router.post('/analyze-lab-test', analyzeLabTest);
router.post('/analyze-medications', analyzeMedications);
router.post('/generate-meal-plan', generateMealPlan);
router.post('/health-analysis', healthAnalysis);

export default router;
