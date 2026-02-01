const mongoose = require('mongoose');

const samsungHealthSyncSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    steps: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number, // meters
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    activeMinutes: {
      type: Number,
      default: 0,
    },
    heartRate: {
      min: Number,
      max: Number,
      average: Number,
    },
    sleep: {
      duration: Number, // minutes
      startTime: Date,
      endTime: Date,
      deepSleep: Number,
      lightSleep: Number,
      remSleep: Number,
    },
    exercises: [
      {
        type: String,
        name: String,
        startTime: Date,
        endTime: Date,
        duration: Number, // minutes
        caloriesBurned: Number,
        distance: Number,
        source: {
          type: String,
          default: 'samsung_health',
        },
      },
    ],
    source: {
      type: String,
      default: 'samsung_health',
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
samsungHealthSyncSchema.index({ userId: 1, date: -1 });

// Prevent duplicate entries for same user and date
samsungHealthSyncSchema.index({ userId: 1, date: 1 }, { unique: true });

const SamsungHealthSync = mongoose.model('SamsungHealthSync', samsungHealthSyncSchema);

module.exports = SamsungHealthSync;
