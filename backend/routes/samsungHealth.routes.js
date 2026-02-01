const express = require('express');
const router = express.Router();
const samsungHealthController = require('../controllers/samsungHealth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Sync health data from Samsung Health
router.post('/sync', samsungHealthController.syncHealthData);

// Get health statistics
router.get('/stats', samsungHealthController.getHealthStats);

// Get last sync time
router.get('/last-sync', samsungHealthController.getLastSyncTime);

module.exports = router;
