const express = require('express');
const router = express.Router();
const gestureMusicController = require('../controllers/gestureMusic.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.get('/gestures', gestureMusicController.getGestures);
router.get('/test/:gestureType', gestureMusicController.testGesture);

// Protected routes (require authentication)
router.use(authenticateToken);

router.post('/analyze', gestureMusicController.analyzeGesture);
router.post('/reset', gestureMusicController.resetSession);

module.exports = router;
