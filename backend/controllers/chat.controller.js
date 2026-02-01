const openaiService = require('../services/openai.service');
const openrouterService = require('../services/openrouter.service');
const ChatSession = require('../models/ChatHistory');
const User = require('../models/User');
const HealthProfile = require('../models/HealthProfile');
const { calculateAllMetrics } = require('../services/calculation.service');

// Use OpenRouter by default (can be toggled via env)
const USE_OPENROUTER = process.env.USE_OPENROUTER !== 'false';

/**
 * Chat Controller
 * Handles AI chatbot conversations
 */

/**
 * Helper function to build user context
 */
const buildUserContext = async (userId) => {
  const user = await User.findById(userId).select('-password');
  const healthProfile = await HealthProfile.findOne({ userId });

  let metrics = null;
  if (user.weight && user.height && user.age && user.gender) {
    metrics = calculateAllMetrics({
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
    });
  }

  return {
    name: user.name,
    language: user.preferences?.language || 'en',
    age: user.age,
    gender: user.gender,
    weight: user.weight,
    height: user.height,
    bmi: metrics?.bmi,
    bmr: metrics?.bmr,
    tdee: metrics?.tdee,
    activityLevel: user.activityLevel,
    goals: user.goals,
    healthConditions: healthProfile?.diseases || [],
    medications: healthProfile?.medications || [],
    allergies: healthProfile?.allergies || [],
    preferences: user.preferences,
  };
};

/**
 * Send message to AI chatbot
 * POST /api/chat/message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, isVoice } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Get or create session
    const session = await ChatSession.getOrCreateSession(req.userId, sessionId);

    // Build user context
    const userContext = await buildUserContext(req.userId);

    // Get conversation history
    const conversationHistory = session.getConversationHistory(10);

    // Use OpenRouter (Gemini) or OpenAI based on config
    let result;
    if (USE_OPENROUTER) {
      if (isVoice) {
        result = await openrouterService.voiceChat(
          message,
          userContext,
          conversationHistory
        );
      } else {
        result = await openrouterService.chat(
          message,
          userContext,
          conversationHistory
        );
      }
    } else {
      result = await openaiService.chatWithContext(
        message,
        userContext,
        conversationHistory
      );
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'AI chat failed',
        error: result.error,
      });
    }

    // Add user message to session
    await session.addMessage('user', message, 0);

    // Add AI response to session
    await session.addMessage('assistant', result.message, result.tokensUsed);

    res.json({
      success: true,
      message: result.message,
      sessionId: session._id,
      tokensUsed: result.tokensUsed,
      isVoice: isVoice || false,
      model: result.model || 'openai',
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
};

/**
 * Voice chat endpoint
 * POST /api/chat/voice
 */
exports.voiceChat = async (req, res) => {
  try {
    const { transcribedText, sessionId } = req.body;

    if (!transcribedText || transcribedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transcribed text is required',
      });
    }

    // Get or create session
    const session = await ChatSession.getOrCreateSession(req.userId, sessionId);

    // Build user context
    const userContext = await buildUserContext(req.userId);

    // Get conversation history
    const conversationHistory = session.getConversationHistory(10);

    // Use OpenRouter for voice chat
    const result = await openrouterService.voiceChat(
      transcribedText,
      userContext,
      conversationHistory
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Voice chat failed',
        error: result.error,
      });
    }

    // Add user message to session
    await session.addMessage('user', transcribedText, 0);

    // Add AI response to session
    await session.addMessage('assistant', result.message, result.tokensUsed);

    res.json({
      success: true,
      message: result.message,
      sessionId: session._id,
      tokensUsed: result.tokensUsed,
      isVoice: true,
    });
  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice chat',
      error: error.message,
    });
  }
};

/**
 * Create new chat session
 * POST /api/chat/session
 */
exports.createSession = async (req, res) => {
  try {
    const { title } = req.body || {};

    const session = await ChatSession.create({
      userId: req.userId,
      title: title || 'New Chat',
      messages: [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        messageCount: 0,
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session',
      error: error.message,
    });
  }
};

/**
 * Get user's chat sessions
 * GET /api/chat/sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const { limit = 20, includeArchived = false } = req.query;

    const query = { userId: req.userId };
    if (!includeArchived || includeArchived === 'false') {
      query.isActive = true;
    }

    const sessions = await ChatSession.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .select('title lastMessageAt messageCount totalTokensUsed isActive createdAt');

    res.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions',
      error: error.message,
    });
  }
};

/**
 * Get specific session with messages
 * GET /api/chat/session/:sessionId
 */
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session',
      error: error.message,
    });
  }
};

/**
 * Update session (rename, archive)
 * PUT /api/chat/session/:sessionId
 */
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, isActive } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (isActive !== undefined) updates.isActive = isActive;

    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId: req.userId },
      updates,
      { new: true, select: 'title isActive lastMessageAt messageCount' }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update chat session',
      error: error.message,
    });
  }
};

/**
 * Delete session
 * DELETE /api/chat/session/:sessionId
 */
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      userId: req.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found',
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: error.message,
    });
  }
};

/**
 * Get chat statistics
 * GET /api/chat/stats
 */
exports.getChatStats = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.userId });

    const stats = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.isActive).length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      totalTokensUsed: sessions.reduce((sum, s) => sum + s.totalTokensUsed, 0),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics',
      error: error.message,
    });
  }
};
