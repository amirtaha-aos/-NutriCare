const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'running',
        'walking',
        'cycling',
        'swimming',
        'weightlifting',
        'yoga',
        'pilates',
        'cardio',
        'sports',
        'other',
      ],
    },
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // minutes
      required: true,
    },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      default: 'moderate',
    },
    caloriesBurned: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number, // km
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    source: {
      type: String,
      enum: ['manual', 'samsung_health', 'other'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
exerciseSchema.index({ userId: 1, date: -1 });

// Static method: Calculate calories burned
exerciseSchema.statics.calculateCalories = function (type, duration, weight, intensity) {
  // MET (Metabolic Equivalent of Task) values
  const metValues = {
    running: { low: 6, moderate: 9.8, high: 12.8 },
    walking: { low: 2.5, moderate: 3.5, high: 4.5 },
    cycling: { low: 4, moderate: 8, high: 12 },
    swimming: { low: 6, moderate: 8, high: 11 },
    weightlifting: { low: 3, moderate: 6, high: 8 },
    yoga: { low: 2, moderate: 3, high: 4 },
    pilates: { low: 3, moderate: 4, high: 5 },
    cardio: { low: 5, moderate: 7, high: 10 },
    sports: { low: 5, moderate: 8, high: 11 },
    other: { low: 3, moderate: 5, high: 7 },
  };

  const met = metValues[type]?.[intensity] || 5;
  const calories = (met * weight * duration) / 60;
  return Math.round(calories);
};

// Static method: Get daily stats
exerciseSchema.statics.getDailyStats = async function (userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const exercises = await this.find({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDistance = exercises.reduce((sum, ex) => sum + (ex.distance || 0), 0);

  return {
    exercises,
    totalDuration,
    totalCalories,
    totalDistance,
    count: exercises.length,
  };
};

// Static method: Get weekly stats
exerciseSchema.statics.getWeeklyStats = async function (userId, startDate) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(startDate);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const exercises = await this.find({
    userId,
    date: { $gte: start, $lte: end },
  });

  const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const totalDistance = exercises.reduce((sum, ex) => sum + (ex.distance || 0), 0);

  // Group by day
  const byDay = {};
  exercises.forEach((ex) => {
    const day = ex.date.toISOString().split('T')[0];
    if (!byDay[day]) {
      byDay[day] = {
        duration: 0,
        calories: 0,
        distance: 0,
        count: 0,
      };
    }
    byDay[day].duration += ex.duration;
    byDay[day].calories += ex.caloriesBurned;
    byDay[day].distance += ex.distance || 0;
    byDay[day].count += 1;
  });

  return {
    totalDuration,
    totalCalories,
    totalDistance,
    totalExercises: exercises.length,
    byDay,
  };
};

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
