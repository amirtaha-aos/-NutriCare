const { MoodEntry, BreathingSession } = require('../models/MoodTracking');
const gamificationService = require('../services/gamification.service');

// Log mood entry
exports.logMood = async (req, res) => {
  try {
    const userId = req.userId;
    const { mood, energy, stress, sleep, activities, factors, notes } = req.body;

    // Convert mood to score
    const moodScores = { great: 5, good: 4, okay: 3, bad: 2, terrible: 1 };
    const stressScores = { none: 1, low: 2, moderate: 3, high: 4, extreme: 5 };

    const entry = await MoodEntry.create({
      userId,
      mood,
      moodScore: moodScores[mood] || 3,
      energy,
      stress,
      stressScore: stressScores[stress] || 2,
      sleep,
      activities,
      factors,
      notes
    });

    // Award XP for logging mood
    await gamificationService.awardXp(userId, 5, 'mood_logged');

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mood history
exports.getMoodHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error getting mood history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mood analytics
exports.getMoodAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: startDate }
    });

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: {
          averageMood: 0,
          averageStress: 0,
          totalEntries: 0,
          moodTrend: 'stable',
          insights: []
        }
      });
    }

    // Calculate averages
    const avgMood = entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length;
    const avgStress = entries.reduce((sum, e) => sum + e.stressScore, 0) / entries.length;

    // Count mood distribution
    const moodDistribution = {};
    entries.forEach(e => {
      moodDistribution[e.mood] = (moodDistribution[e.mood] || 0) + 1;
    });

    // Count common factors
    const factorCounts = {};
    entries.forEach(e => {
      e.factors?.forEach(f => {
        factorCounts[f] = (factorCounts[f] || 0) + 1;
      });
    });

    // Analyze mood by activity
    const activityMoodMap = {};
    entries.forEach(e => {
      e.activities?.forEach(a => {
        if (!activityMoodMap[a]) {
          activityMoodMap[a] = { total: 0, count: 0 };
        }
        activityMoodMap[a].total += e.moodScore;
        activityMoodMap[a].count += 1;
      });
    });

    const activityImpact = Object.entries(activityMoodMap)
      .map(([activity, data]) => ({
        activity,
        averageMood: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.averageMood - a.averageMood);

    // Calculate trend (compare first half to second half)
    const midPoint = Math.floor(entries.length / 2);
    const recentAvg = entries.slice(0, midPoint).reduce((sum, e) => sum + e.moodScore, 0) / midPoint || 0;
    const olderAvg = entries.slice(midPoint).reduce((sum, e) => sum + e.moodScore, 0) / (entries.length - midPoint) || 0;

    let moodTrend = 'stable';
    if (recentAvg - olderAvg > 0.5) moodTrend = 'improving';
    else if (olderAvg - recentAvg > 0.5) moodTrend = 'declining';

    // Generate insights
    const insights = [];

    if (avgMood >= 4) {
      insights.push({ type: 'positive', message: 'Your overall mood has been great!' });
    } else if (avgMood < 3) {
      insights.push({ type: 'attention', message: 'Your mood has been lower than usual. Consider talking to someone.' });
    }

    if (avgStress > 3.5) {
      insights.push({ type: 'warning', message: 'Your stress levels are elevated. Try some breathing exercises.' });
    }

    if (activityImpact.length > 0) {
      const bestActivity = activityImpact[0];
      insights.push({
        type: 'tip',
        message: `${bestActivity.activity} seems to boost your mood the most!`
      });
    }

    // Sleep correlation
    const sleepEntries = entries.filter(e => e.sleep?.hours);
    if (sleepEntries.length > 5) {
      const goodSleep = sleepEntries.filter(e => e.sleep.hours >= 7);
      const badSleep = sleepEntries.filter(e => e.sleep.hours < 6);

      if (goodSleep.length > 0 && badSleep.length > 0) {
        const goodSleepMood = goodSleep.reduce((sum, e) => sum + e.moodScore, 0) / goodSleep.length;
        const badSleepMood = badSleep.reduce((sum, e) => sum + e.moodScore, 0) / badSleep.length;

        if (goodSleepMood - badSleepMood > 0.5) {
          insights.push({
            type: 'insight',
            message: 'Better sleep correlates with better mood for you!'
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        averageMood: Math.round(avgMood * 10) / 10,
        averageStress: Math.round(avgStress * 10) / 10,
        totalEntries: entries.length,
        moodTrend,
        moodDistribution,
        topFactors: Object.entries(factorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([factor, count]) => ({ factor, count })),
        activityImpact: activityImpact.slice(0, 5),
        insights
      }
    });
  } catch (error) {
    console.error('Error getting mood analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Log breathing session
exports.logBreathingSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { exerciseType, duration, cycles } = req.body;

    const session = await BreathingSession.create({
      userId,
      exerciseType,
      duration,
      cycles
    });

    // Award XP for breathing exercise
    const xpAmount = Math.min(Math.floor(duration / 60) * 5, 25); // 5 XP per minute, max 25
    await gamificationService.awardXp(userId, xpAmount, 'breathing_exercise');

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error logging breathing session:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get breathing exercise types
exports.getBreathingExercises = async (req, res) => {
  const exercises = [
    {
      id: '4-7-8',
      name: '4-7-8 Relaxing Breath',
      description: 'Inhale for 4s, hold for 7s, exhale for 8s. Great for sleep and anxiety.',
      inhale: 4,
      hold: 7,
      exhale: 8,
      cycles: 4,
      benefits: ['Reduces anxiety', 'Helps with sleep', 'Calms nervous system']
    },
    {
      id: 'box',
      name: 'Box Breathing',
      description: 'Equal parts inhale, hold, exhale, hold. Used by Navy SEALs.',
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfter: 4,
      cycles: 4,
      benefits: ['Increases focus', 'Reduces stress', 'Improves concentration']
    },
    {
      id: 'deep',
      name: 'Deep Breathing',
      description: 'Simple deep breaths to quickly calm down.',
      inhale: 5,
      exhale: 5,
      cycles: 6,
      benefits: ['Quick stress relief', 'Easy to learn', 'Can do anywhere']
    },
    {
      id: 'calm',
      name: 'Calming Breath',
      description: 'Extended exhale for deep relaxation.',
      inhale: 4,
      exhale: 8,
      cycles: 5,
      benefits: ['Activates rest response', 'Lowers heart rate', 'Deep relaxation']
    }
  ];

  res.json({
    success: true,
    data: exercises
  });
};

// Get today's mood
exports.getTodayMood = async (req, res) => {
  try {
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await MoodEntry.findOne({
      userId,
      date: { $gte: today }
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error getting today mood:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
