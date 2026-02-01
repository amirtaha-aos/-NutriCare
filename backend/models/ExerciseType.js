const mongoose = require('mongoose');

/**
 * Exercise Type Schema
 * Defines available exercise types with their calorie burn rates
 */
const exerciseTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  nameFa: {
    type: String
  },
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'sports'],
    required: true
  },
  caloriesPerMinute: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  description: {
    type: String
  },
  descriptionFa: {
    type: String
  },
  muscleGroups: [{
    type: String
  }],
  equipment: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const ExerciseType = mongoose.model('ExerciseType', exerciseTypeSchema);

module.exports = ExerciseType;
