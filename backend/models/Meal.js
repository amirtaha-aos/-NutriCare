const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 200
  },
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  fiber: {
    type: Number,
    default: 0
  },
  // Food items in the meal
  items: [{
    name: String,
    portion: String,
    calories: Number
  }],
  // Optional image URL
  imageUrl: {
    type: String
  },
  // Notes
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for querying meals by user and date
MealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', MealSchema);
