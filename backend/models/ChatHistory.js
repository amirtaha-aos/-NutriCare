const mongoose = require('mongoose');

/**
 * Message Schema
 * Individual messages within a chat session
 */
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

/**
 * Chat Session Schema
 * Represents a conversation session with the AI chatbot
 */
const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      maxlength: 100,
    },
    messages: [messageSchema],
    // Session metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // AI usage tracking
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    // Context snapshot (to provide better responses)
    userContext: {
      language: String,
      recentMeals: [String], // IDs of recent meals
      currentGoals: String,
      healthConditions: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chatSessionSchema.index({ userId: 1, isActive: 1, lastMessageAt: -1 });
chatSessionSchema.index({ userId: 1, createdAt: -1 });

// Virtual for message count
chatSessionSchema.virtual('messagesCount').get(function () {
  return this.messages.length;
});

// Pre-save middleware to update metadata
chatSessionSchema.pre('save', function () {
  if (this.messages && this.messages.length > 0) {
    // Update last message time
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;

    // Update message count
    this.messageCount = this.messages.length;

    // Calculate total tokens
    this.totalTokensUsed = this.messages.reduce(
      (sum, msg) => sum + (msg.tokensUsed || 0),
      0
    );

    // Auto-generate title from first user message if still "New Chat"
    if (this.title === 'New Chat' && this.messages.length > 0) {
      const firstUserMessage = this.messages.find((msg) => msg.role === 'user');
      if (firstUserMessage) {
        // Use first 50 chars of first message as title
        this.title = firstUserMessage.content.substring(0, 50);
        if (firstUserMessage.content.length > 50) {
          this.title += '...';
        }
      }
    }
  }
});

// Instance method: Add message to session
chatSessionSchema.methods.addMessage = function (role, content, tokensUsed = 0) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
    tokensUsed,
  });

  this.lastMessageAt = new Date();
  this.isActive = true;

  return this.save();
};

// Instance method: Get conversation history (last N messages)
chatSessionSchema.methods.getConversationHistory = function (limit = 10) {
  const messages = this.messages.slice(-limit);
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
};

// Static method: Get user's active sessions
chatSessionSchema.statics.getActiveSessions = async function (userId, limit = 20) {
  return this.find({
    userId,
    isActive: true,
  })
    .sort({ lastMessageAt: -1 })
    .limit(limit)
    .select('-messages'); // Don't include full message history
};

// Static method: Get or create session
chatSessionSchema.statics.getOrCreateSession = async function (userId, sessionId = null) {
  if (sessionId) {
    const session = await this.findOne({ _id: sessionId, userId });
    if (session) return session;
  }

  // Create new session
  return this.create({
    userId,
    title: 'New Chat',
    messages: [],
    isActive: true,
  });
};

// Static method: Archive old sessions
chatSessionSchema.statics.archiveOldSessions = async function (userId, daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.updateMany(
    {
      userId,
      lastMessageAt: { $lt: cutoffDate },
      isActive: true,
    },
    {
      $set: { isActive: false },
    }
  );
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;
