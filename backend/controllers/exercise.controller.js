const Exercise = require('../models/Exercise');
const User = require('../models/User');

exports.logExercise = async (req, res) => {
  try {
    const { type, name, duration, intensity, distance, date, notes } = req.body;
    const userId = req.userId;

    if (!type || !name || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Type, name, and duration are required',
      });
    }

    // Get user weight for calorie calculation
    const user = await User.findById(userId);
    const weight = user?.weight || 70; // default 70kg

    // Calculate calories
    const caloriesBurned = Exercise.calculateCalories(
      type,
      duration,
      weight,
      intensity || 'moderate'
    );

    const exercise = await Exercise.create({
      userId,
      type,
      name,
      duration,
      intensity: intensity || 'moderate',
      caloriesBurned,
      distance,
      date: date || new Date(),
      notes,
      source: 'manual',
    });

    res.status(201).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    console.error('Log exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log exercise',
    });
  }
};

exports.getExerciseHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit = 50 } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const exercises = await Exercise.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise history',
    });
  }
};

exports.getDailyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { date = new Date().toISOString() } = req.query;

    const stats = await Exercise.getDailyStats(userId, date);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily stats',
    });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate = new Date().toISOString() } = req.query;

    const stats = await Exercise.getWeeklyStats(userId, startDate);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly stats',
    });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.userId;

    const exercise = await Exercise.findOneAndDelete({
      _id: exerciseId,
      userId,
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    res.json({
      success: true,
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exercise',
    });
  }
};
