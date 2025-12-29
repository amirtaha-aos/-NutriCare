const mongoose = require('mongoose');

const HealthLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Water intake
  waterIntake: {
    type: Number,
    default: 0,
    min: 0,
    max: 20
  },
  // Steps
  steps: {
    type: Number,
    default: 0
  },
  // Sleep hours
  sleepHours: {
    type: Number,
    default: 0
  },
  // Weight log
  weight: {
    type: Number
  },
  // Mood
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible', null],
    default: null
  },
  // Notes
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index for user + date (one log per day per user)
HealthLogSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('HealthLog', HealthLogSchema);
