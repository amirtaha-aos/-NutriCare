const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { chatMessageLimiter } = require('../middleware/rateLimiter.middleware');

/**
 * Chat Routes
 * All routes require authentication
 */

// Send message to AI chatbot
router.post('/message', authenticateToken, chatMessageLimiter, chatController.sendMessage);

// Voice chat endpoint
router.post('/voice', authenticateToken, chatMessageLimiter, chatController.voiceChat);

// Session management
router.post('/session', authenticateToken, chatController.createSession);

router.get('/sessions', authenticateToken, chatController.getSessions);

router.get('/session/:sessionId', authenticateToken, chatController.getSession);

router.put('/session/:sessionId', authenticateToken, chatController.updateSession);

router.delete('/session/:sessionId', authenticateToken, chatController.deleteSession);

// Statistics
router.get('/stats', authenticateToken, chatController.getChatStats);

module.exports = router;
