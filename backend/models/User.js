const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 1,
    max: 150,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  weight: {
    type: Number, // in kg
    min: 1,
  },
  height: {
    type: Number, // in cm
    min: 1,
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate',
  },
  goals: {
    targetWeight: Number,
    dailyCalories: Number,
    dailyProtein: Number,
    dailyCarbs: Number,
    dailyFats: Number,
    goalType: {
      type: String,
      enum: ['lose_weight', 'maintain', 'gain_muscle'],
    },
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'fa'],
      default: 'en',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    weeklyBudget: Number,
    location: {
      city: String,
      country: String,
    },
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
