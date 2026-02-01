const { UserStats, Badge, UserBadge, Challenge, UserChallenge, Leaderboard } = require('../models/Gamification');

// XP required for each level (exponential growth)
const getXpForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Get level from total XP
const getLevelFromXp = (totalXp) => {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded <= totalXp) {
    xpNeeded += getXpForLevel(level);
    if (xpNeeded <= totalXp) level++;
  }
  return level;
};

// XP rewards for different activities
const XP_REWARDS = {
  LOG_MEAL: 10,
  LOG_EXERCISE: 15,
  COMPLETE_DAILY_GOAL: 25,
  MAINTAIN_STREAK: 20,
  DRINK_WATER: 5,
  COMPLETE_CHALLENGE: 50,
  FIRST_MEAL_OF_DAY: 5,
  PERFECT_DAY: 100, // Hit all goals
};

// Predefined badges
const BADGES = [
  // Streak badges
  { id: 'streak_3', name: 'Getting Started', description: '3 day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 3 }, xpReward: 50, rarity: 'common' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 7 }, xpReward: 100, rarity: 'common' },
  { id: 'streak_14', name: 'Two Week Champion', description: '14 day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 14 }, xpReward: 200, rarity: 'rare' },
  { id: 'streak_30', name: 'Monthly Master', description: '30 day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 30 }, xpReward: 500, rarity: 'epic' },
  { id: 'streak_100', name: 'Unstoppable', description: '100 day streak', icon: 'fire', category: 'streak', requirement: { type: 'streak', value: 100 }, xpReward: 1000, rarity: 'legendary' },

  // Nutrition badges
  { id: 'meals_10', name: 'Food Logger', description: 'Log 10 meals', icon: 'food', category: 'nutrition', requirement: { type: 'meals', value: 10 }, xpReward: 50, rarity: 'common' },
  { id: 'meals_50', name: 'Nutrition Tracker', description: 'Log 50 meals', icon: 'food', category: 'nutrition', requirement: { type: 'meals', value: 50 }, xpReward: 150, rarity: 'common' },
  { id: 'meals_100', name: 'Diet Dedicated', description: 'Log 100 meals', icon: 'food', category: 'nutrition', requirement: { type: 'meals', value: 100 }, xpReward: 300, rarity: 'rare' },
  { id: 'meals_500', name: 'Nutrition Expert', description: 'Log 500 meals', icon: 'food', category: 'nutrition', requirement: { type: 'meals', value: 500 }, xpReward: 750, rarity: 'epic' },

  // Exercise badges
  { id: 'exercise_5', name: 'Active Beginner', description: 'Complete 5 workouts', icon: 'dumbbell', category: 'exercise', requirement: { type: 'exercises', value: 5 }, xpReward: 50, rarity: 'common' },
  { id: 'exercise_25', name: 'Fitness Fan', description: 'Complete 25 workouts', icon: 'dumbbell', category: 'exercise', requirement: { type: 'exercises', value: 25 }, xpReward: 200, rarity: 'rare' },
  { id: 'exercise_100', name: 'Gym Rat', description: 'Complete 100 workouts', icon: 'dumbbell', category: 'exercise', requirement: { type: 'exercises', value: 100 }, xpReward: 500, rarity: 'epic' },

  // Level badges
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: 'star', category: 'special', requirement: { type: 'level', value: 5 }, xpReward: 100, rarity: 'common' },
  { id: 'level_10', name: 'Health Hero', description: 'Reach level 10', icon: 'star', category: 'special', requirement: { type: 'level', value: 10 }, xpReward: 250, rarity: 'rare' },
  { id: 'level_25', name: 'Wellness Warrior', description: 'Reach level 25', icon: 'star', category: 'special', requirement: { type: 'level', value: 25 }, xpReward: 500, rarity: 'epic' },
  { id: 'level_50', name: 'Legendary', description: 'Reach level 50', icon: 'crown', category: 'special', requirement: { type: 'level', value: 50 }, xpReward: 1000, rarity: 'legendary' },

  // Water badges
  { id: 'water_50', name: 'Hydration Starter', description: 'Log 50 glasses of water', icon: 'water', category: 'nutrition', requirement: { type: 'water', value: 50 }, xpReward: 75, rarity: 'common' },
  { id: 'water_200', name: 'Well Hydrated', description: 'Log 200 glasses of water', icon: 'water', category: 'nutrition', requirement: { type: 'water', value: 200 }, xpReward: 200, rarity: 'rare' },
];

// Predefined challenges
const DAILY_CHALLENGES = [
  { id: 'daily_3meals', title: 'Three Square Meals', description: 'Log 3 meals today', type: 'daily', category: 'nutrition', requirement: { type: 'meals', value: 3 }, xpReward: 30 },
  { id: 'daily_water8', title: 'Stay Hydrated', description: 'Drink 8 glasses of water', type: 'daily', category: 'hydration', requirement: { type: 'water', value: 8 }, xpReward: 25 },
  { id: 'daily_exercise', title: 'Get Moving', description: 'Complete 1 workout', type: 'daily', category: 'exercise', requirement: { type: 'exercise_minutes', value: 1 }, xpReward: 35 },
  { id: 'daily_protein', title: 'Protein Power', description: 'Eat 100g of protein', type: 'daily', category: 'nutrition', requirement: { type: 'protein', value: 100 }, xpReward: 40 },
];

const WEEKLY_CHALLENGES = [
  { id: 'weekly_meals20', title: 'Consistent Logger', description: 'Log 20 meals this week', type: 'weekly', category: 'nutrition', requirement: { type: 'meals', value: 20 }, xpReward: 150 },
  { id: 'weekly_exercise5', title: 'Active Week', description: 'Complete 5 workouts this week', type: 'weekly', category: 'exercise', requirement: { type: 'exercise_minutes', value: 5 }, xpReward: 200 },
  { id: 'weekly_streak7', title: 'Perfect Week', description: 'Maintain a 7-day streak', type: 'weekly', category: 'mixed', requirement: { type: 'streak', value: 7 }, xpReward: 250 },
];

class GamificationService {
  // Initialize badges in database
  async initializeBadges() {
    for (const badge of BADGES) {
      await Badge.findOneAndUpdate(
        { id: badge.id },
        badge,
        { upsert: true, new: true }
      );
    }
    console.log('Badges initialized');
  }

  // Get or create user stats
  async getUserStats(userId) {
    let stats = await UserStats.findOne({ userId });
    if (!stats) {
      stats = await UserStats.create({ userId });
    }
    return stats;
  }

  // Award XP to user
  async awardXp(userId, amount, reason) {
    const stats = await this.getUserStats(userId);
    stats.xp += amount;
    stats.totalXpEarned += amount;
    stats.weeklyXp += amount;

    // Check for level up
    const newLevel = getLevelFromXp(stats.totalXpEarned);
    const leveledUp = newLevel > stats.level;
    stats.level = newLevel;

    await stats.save();

    // Update leaderboard
    await this.updateLeaderboard(userId, amount);

    // Check for new badges
    const newBadges = await this.checkBadges(userId, stats);

    return {
      xpAwarded: amount,
      reason,
      totalXp: stats.totalXpEarned,
      currentXp: stats.xp,
      level: stats.level,
      leveledUp,
      xpToNextLevel: getXpForLevel(stats.level) - (stats.totalXpEarned - this.getXpForPreviousLevels(stats.level)),
      newBadges
    };
  }

  getXpForPreviousLevels(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXpForLevel(i);
    }
    return total;
  }

  // Update streak
  async updateStreak(userId) {
    const stats = await this.getUserStats(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stats.lastActivityDate) {
      const lastActivity = new Date(stats.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, no change
        return stats.currentStreak;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
        // Award streak XP
        await this.awardXp(userId, XP_REWARDS.MAINTAIN_STREAK, 'streak_maintained');
      } else {
        // Streak broken
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
    }

    stats.lastActivityDate = today;
    await stats.save();

    // Check streak badges
    await this.checkBadges(userId, stats);

    return stats.currentStreak;
  }

  // Log activity and update stats
  async logActivity(userId, activityType, data = {}) {
    const stats = await this.getUserStats(userId);
    let xpToAward = 0;

    switch (activityType) {
      case 'meal':
        stats.mealsLogged += 1;
        xpToAward = XP_REWARDS.LOG_MEAL;
        break;
      case 'exercise':
        stats.exercisesCompleted += 1;
        xpToAward = XP_REWARDS.LOG_EXERCISE;
        break;
      case 'water':
        stats.waterGlasses += data.glasses || 1;
        xpToAward = XP_REWARDS.DRINK_WATER * (data.glasses || 1);
        break;
    }

    await stats.save();

    // Update streak
    await this.updateStreak(userId);

    // Award XP
    const xpResult = await this.awardXp(userId, xpToAward, activityType);

    // Update challenge progress
    await this.updateChallengeProgress(userId, activityType, data);

    return {
      ...xpResult,
      stats: {
        mealsLogged: stats.mealsLogged,
        exercisesCompleted: stats.exercisesCompleted,
        waterGlasses: stats.waterGlasses,
        currentStreak: stats.currentStreak
      }
    };
  }

  // Check and award badges
  async checkBadges(userId, stats) {
    const allBadges = await Badge.find({});
    const userBadges = await UserBadge.find({ userId });
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    const newBadges = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;
      switch (badge.requirement.type) {
        case 'streak':
          earned = stats.currentStreak >= badge.requirement.value;
          break;
        case 'meals':
          earned = stats.mealsLogged >= badge.requirement.value;
          break;
        case 'exercises':
          earned = stats.exercisesCompleted >= badge.requirement.value;
          break;
        case 'level':
          earned = stats.level >= badge.requirement.value;
          break;
        case 'water':
          earned = stats.waterGlasses >= badge.requirement.value;
          break;
      }

      if (earned) {
        await UserBadge.create({ userId, badgeId: badge.id });
        newBadges.push(badge);
        // Award badge XP
        stats.xp += badge.xpReward;
        stats.totalXpEarned += badge.xpReward;
      }
    }

    if (newBadges.length > 0) {
      await stats.save();
    }

    return newBadges;
  }

  // Get user badges
  async getUserBadges(userId) {
    const allBadges = await Badge.find({});
    const userBadges = await UserBadge.find({ userId });
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

    return allBadges.map(badge => ({
      ...badge.toObject(),
      earned: earnedBadgeIds.includes(badge.id),
      earnedAt: userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
    }));
  }

  // Get active challenges
  async getActiveChallenges(userId) {
    const today = new Date();
    const challenges = await Challenge.find({ isActive: true });
    const userChallenges = await UserChallenge.find({ userId });

    return challenges.map(challenge => {
      const userProgress = userChallenges.find(uc => uc.challengeId === challenge.id);
      return {
        ...challenge.toObject(),
        progress: userProgress?.progress || 0,
        completed: userProgress?.completed || false,
        joined: !!userProgress
      };
    });
  }

  // Join a challenge
  async joinChallenge(userId, challengeId) {
    const challenge = await Challenge.findOne({ id: challengeId, isActive: true });
    if (!challenge) throw new Error('Challenge not found');

    const existing = await UserChallenge.findOne({ userId, challengeId });
    if (existing) return existing;

    return await UserChallenge.create({ userId, challengeId, progress: 0 });
  }

  // Update challenge progress
  async updateChallengeProgress(userId, activityType, data) {
    const userChallenges = await UserChallenge.find({ userId, completed: false });
    const completedChallenges = [];

    for (const uc of userChallenges) {
      const challenge = await Challenge.findOne({ id: uc.challengeId });
      if (!challenge) continue;

      let shouldIncrement = false;
      let incrementAmount = 1;

      switch (challenge.requirement.type) {
        case 'meals':
          shouldIncrement = activityType === 'meal';
          break;
        case 'exercise_minutes':
          shouldIncrement = activityType === 'exercise';
          incrementAmount = data.minutes || 1;
          break;
        case 'water':
          shouldIncrement = activityType === 'water';
          incrementAmount = data.glasses || 1;
          break;
        case 'protein':
          shouldIncrement = activityType === 'meal' && data.protein;
          incrementAmount = data.protein || 0;
          break;
      }

      if (shouldIncrement) {
        uc.progress += incrementAmount;

        if (uc.progress >= challenge.requirement.value) {
          uc.completed = true;
          uc.completedAt = new Date();
          completedChallenges.push(challenge);
          // Award challenge XP
          await this.awardXp(userId, challenge.xpReward, 'challenge_completed');
        }

        await uc.save();
      }
    }

    return completedChallenges;
  }

  // Get leaderboard
  async getLeaderboard(limit = 20) {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    return await Leaderboard.find({ weekNumber, year })
      .sort({ weeklyXp: -1 })
      .limit(limit)
      .lean();
  }

  // Update leaderboard
  async updateLeaderboard(userId, xpAmount) {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    await Leaderboard.findOneAndUpdate(
      { userId, weekNumber, year },
      {
        $inc: { weeklyXp: xpAmount },
        $setOnInsert: { username: 'User' }
      },
      { upsert: true }
    );
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // Get user rank
  async getUserRank(userId) {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();

    const userEntry = await Leaderboard.findOne({ userId, weekNumber, year });
    if (!userEntry) return null;

    const rank = await Leaderboard.countDocuments({
      weekNumber,
      year,
      weeklyXp: { $gt: userEntry.weeklyXp }
    }) + 1;

    return { rank, weeklyXp: userEntry.weeklyXp };
  }

  // Create daily challenges
  async createDailyChallenges() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const challenge of DAILY_CHALLENGES) {
      await Challenge.findOneAndUpdate(
        { id: `${challenge.id}_${today.toISOString().split('T')[0]}` },
        {
          ...challenge,
          id: `${challenge.id}_${today.toISOString().split('T')[0]}`,
          startDate: today,
          endDate: tomorrow,
          isActive: true
        },
        { upsert: true }
      );
    }
  }

  // Get full gamification profile
  async getGamificationProfile(userId) {
    const stats = await this.getUserStats(userId);
    const badges = await this.getUserBadges(userId);
    const challenges = await this.getActiveChallenges(userId);
    const rank = await this.getUserRank(userId);
    const leaderboard = await this.getLeaderboard(10);

    const earnedBadges = badges.filter(b => b.earned);
    const xpForCurrentLevel = this.getXpForPreviousLevels(stats.level);
    const xpInCurrentLevel = stats.totalXpEarned - xpForCurrentLevel;
    const xpNeededForNextLevel = getXpForLevel(stats.level);

    return {
      stats: {
        level: stats.level,
        currentXp: xpInCurrentLevel,
        xpToNextLevel: xpNeededForNextLevel,
        totalXp: stats.totalXpEarned,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        mealsLogged: stats.mealsLogged,
        exercisesCompleted: stats.exercisesCompleted,
        waterGlasses: stats.waterGlasses,
        weeklyXp: stats.weeklyXp
      },
      badges: {
        earned: earnedBadges,
        total: badges.length,
        all: badges
      },
      challenges,
      rank,
      leaderboard
    };
  }
}

module.exports = new GamificationService();
