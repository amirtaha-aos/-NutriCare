const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All health routes require authentication
router.use(authenticateToken);

// Health profile
router.get('/profile', healthController.getProfile.bind(healthController));
router.put('/profile', healthController.updateProfile.bind(healthController));

// Diseases
router.post('/disease', healthController.addDisease.bind(healthController));
router.put('/disease/:diseaseId', healthController.updateDisease.bind(healthController));
router.delete('/disease/:diseaseId', healthController.deleteDisease.bind(healthController));

// Medications
router.post('/medication', healthController.addMedication.bind(healthController));
router.put('/medication/:medicationId', healthController.updateMedication.bind(healthController));
router.delete('/medication/:medicationId', healthController.deleteMedication.bind(healthController));

// Allergies
router.post('/allergy', healthController.addAllergy.bind(healthController));
router.delete('/allergy/:allergyId', healthController.deleteAllergy.bind(healthController));

// Health metrics
router.get('/metrics', healthController.getMetrics.bind(healthController));
router.post('/metrics/calculate', healthController.calculateMetrics.bind(healthController));

// Drug interactions
router.get('/drug-interactions', healthController.checkDrugInteractions.bind(healthController));
router.get('/medication-info/:medicationName', healthController.getMedicationInfo.bind(healthController));

// Lab tests
router.post('/lab-test', healthController.addLabTest.bind(healthController));
router.get('/lab-test/:labTestId', healthController.getLabAnalysis.bind(healthController));
router.delete('/lab-test/:labTestId', healthController.deleteLabTest.bind(healthController));
router.get('/lab-trends', healthController.analyzeLabTrends.bind(healthController));
router.get('/health-insights', healthController.getHealthInsights.bind(healthController));

module.exports = router;
