const SamsungHealthSync = require('../models/SamsungHealthSync');
const Exercise = require('../models/Exercise');

exports.syncHealthData = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, steps, distance, caloriesBurned, activeMinutes, heartRate, sleep, exercises } =
      req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Parse date to start of day
    const syncDate = new Date(date);
    syncDate.setHours(0, 0, 0, 0);

    // Update or create sync record
    const syncData = await SamsungHealthSync.findOneAndUpdate(
      { userId, date: syncDate },
      {
        userId,
        date: syncDate,
        steps: steps || 0,
        distance: distance || 0,
        caloriesBurned: caloriesBurned || 0,
        activeMinutes: activeMinutes || 0,
        heartRate: heartRate || {},
        sleep: sleep || {},
        exercises: exercises || [],
        lastSyncedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // If exercises are provided, also create Exercise records
    if (exercises && exercises.length > 0) {
      const exercisePromises = exercises.map(async (ex) => {
        // Check if this exercise already exists
        const existing = await Exercise.findOne({
          userId,
          source: 'samsung_health',
          date: ex.startTime || syncDate,
          name: ex.name,
        });

        if (!existing) {
          return Exercise.create({
            userId,
            type: ex.type || 'other',
            name: ex.name || 'Samsung Health Exercise',
            duration: ex.duration || 0,
            intensity: 'moderate',
            caloriesBurned: ex.caloriesBurned || 0,
            distance: ex.distance ? ex.distance / 1000 : undefined, // Convert meters to km
            date: ex.startTime || syncDate,
            source: 'samsung_health',
          });
        }
      });

      await Promise.all(exercisePromises);
    }

    res.json({ success: true, data: syncData });
  } catch (error) {
    console.error('Sync health data error:', error);
    res.status(500).json({ success: false, message: 'Failed to sync health data' });
  }
};

exports.getHealthStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const stats = await SamsungHealthSync.find(query).sort({ date: -1 }).limit(30);

    // Calculate aggregated stats
    const aggregated = {
      totalSteps: 0,
      totalDistance: 0,
      totalCalories: 0,
      totalActiveMinutes: 0,
      avgHeartRate: 0,
      totalSleepMinutes: 0,
      days: stats.length,
    };

    let heartRateCount = 0;
    stats.forEach((stat) => {
      aggregated.totalSteps += stat.steps || 0;
      aggregated.totalDistance += stat.distance || 0;
      aggregated.totalCalories += stat.caloriesBurned || 0;
      aggregated.totalActiveMinutes += stat.activeMinutes || 0;

      if (stat.heartRate?.average) {
        aggregated.avgHeartRate += stat.heartRate.average;
        heartRateCount++;
      }

      if (stat.sleep?.duration) {
        aggregated.totalSleepMinutes += stat.sleep.duration;
      }
    });

    if (heartRateCount > 0) {
      aggregated.avgHeartRate = Math.round(aggregated.avgHeartRate / heartRateCount);
    }

    res.json({
      success: true,
      data: {
        dailyStats: stats,
        aggregated,
      },
    });
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get health stats' });
  }
};

exports.getLastSyncTime = async (req, res) => {
  try {
    const userId = req.userId;

    const lastSync = await SamsungHealthSync.findOne({ userId })
      .sort({ lastSyncedAt: -1 })
      .select('lastSyncedAt');

    res.json({
      success: true,
      data: {
        lastSyncedAt: lastSync?.lastSyncedAt || null,
      },
    });
  } catch (error) {
    console.error('Get last sync time error:', error);
    res.status(500).json({ success: false, message: 'Failed to get last sync time' });
  }
};

module.exports = exports;
