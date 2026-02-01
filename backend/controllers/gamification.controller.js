const gamificationService = require('../services/gamification.service');

// Get user's gamification profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const profile = await gamificationService.getGamificationProfile(userId);

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting gamification profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const stats = await gamificationService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all badges
exports.getBadges = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const badges = await gamificationService.getUserBadges(userId);

    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active challenges
exports.getChallenges = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const challenges = await gamificationService.getActiveChallenges(userId);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Error getting challenges:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const { challengeId } = req.params;

    const result = await gamificationService.joinChallenge(userId, challengeId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Log activity (for testing/manual XP)
exports.logActivity = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const { activityType, data } = req.body;

    const result = await gamificationService.logActivity(userId, activityType, data);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await gamificationService.getLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user rank
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user';
    const rank = await gamificationService.getUserRank(userId);

    res.json({
      success: true,
      data: rank
    });
  } catch (error) {
    console.error('Error getting user rank:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Initialize badges (admin)
exports.initializeBadges = async (req, res) => {
  try {
    await gamificationService.initializeBadges();

    res.json({
      success: true,
      message: 'Badges initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing badges:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create daily challenges (can be called by cron job)
exports.createDailyChallenges = async (req, res) => {
  try {
    await gamificationService.createDailyChallenges();

    res.json({
      success: true,
      message: 'Daily challenges created'
    });
  } catch (error) {
    console.error('Error creating daily challenges:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
