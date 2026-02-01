const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    required: true
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  energy: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  stress: {
    type: String,
    enum: ['none', 'low', 'moderate', 'high', 'extreme'],
    default: 'low'
  },
  stressScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 2
  },
  sleep: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    quality: {
      type: String,
      enum: ['great', 'good', 'okay', 'poor', 'terrible']
    }
  },
  activities: [{
    type: String,
    enum: [
      'exercise',
      'meditation',
      'socializing',
      'work',
      'relaxing',
      'outdoors',
      'creative',
      'learning',
      'family',
      'travel'
    ]
  }],
  factors: [{
    type: String,
    enum: [
      'good_sleep',
      'bad_sleep',
      'exercise',
      'healthy_food',
      'junk_food',
      'work_stress',
      'relationship',
      'weather',
      'health_issue',
      'accomplishment',
      'social_event',
      'alone_time'
    ]
  }],
  notes: {
    type: String,
    maxLength: 500
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
moodEntrySchema.index({ userId: 1, date: -1 });
moodEntrySchema.index({ userId: 1, createdAt: -1 });

// Breathing exercise log
const breathingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseType: {
    type: String,
    enum: ['4-7-8', 'box', 'deep', 'calm'],
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  cycles: {
    type: Number,
    default: 1
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema);
const BreathingSession = mongoose.model('BreathingSession', breathingSessionSchema);

module.exports = { MoodEntry, BreathingSession };
