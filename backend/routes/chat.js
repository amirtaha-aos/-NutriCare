const express = require('express');
const router = express.Router();
const {
  startChat,
  sendMessage,
  getChatHistory,
  getMyChatSessions,
  analyzeLabTest
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startChat);
router.post('/message', sendMessage);
router.get('/sessions', getMyChatSessions);
router.get('/history/:sessionId', getChatHistory);
router.post('/analyze-lab', analyzeLabTest);

module.exports = router;
