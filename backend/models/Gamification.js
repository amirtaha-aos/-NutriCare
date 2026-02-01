const mongoose = require('mongoose');

// User Stats Schema - tracks XP, level, streaks
const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  totalXpEarned: {
    type: Number,
    default: 0
  },

  // Streaks
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },

  // Activity counts
  mealsLogged: {
    type: Number,
    default: 0
  },
  exercisesCompleted: {
    type: Number,
    default: 0
  },
  waterGlasses: {
    type: Number,
    default: 0
  },
  caloriesTracked: {
    type: Number,
    default: 0
  },

  // Weekly stats
  weeklyXp: {
    type: Number,
    default: 0
  },
  weekStartDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Badge Schema
const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['streak', 'nutrition', 'exercise', 'social', 'special'],
    required: true
  },
  requirement: {
    type: {
      type: String,
      enum: ['streak', 'meals', 'exercises', 'xp', 'level', 'challenges', 'water'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  xpReward: {
    type: Number,
    default: 50
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
});

// User Badge Schema - tracks which badges user has earned
const userBadgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badgeId: {
    type: String,
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Challenge Schema
const challengeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['nutrition', 'exercise', 'hydration', 'mixed'],
    required: true
  },
  requirement: {
    type: {
      type: String,
      enum: ['meals', 'calories', 'protein', 'exercise_minutes', 'steps', 'water', 'streak'],
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  xpReward: {
    type: Number,
    required: true
  },
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

// User Challenge Progress Schema
const userChallengeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

userChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Leaderboard Schema (weekly reset)
const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: String,
  weeklyXp: {
    type: Number,
    default: 0
  },
  weekNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
});

leaderboardSchema.index({ weekNumber: 1, year: 1, weeklyXp: -1 });

const UserStats = mongoose.model('UserStats', userStatsSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
const Challenge = mongoose.model('Challenge', challengeSchema);
const UserChallenge = mongoose.model('UserChallenge', userChallengeSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = {
  UserStats,
  Badge,
  UserBadge,
  Challenge,
  UserChallenge,
  Leaderboard
};
