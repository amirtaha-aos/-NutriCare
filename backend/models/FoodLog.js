const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner', 'other'],
    required: true
  },
  foods: [{
    name: {
      type: String,
      required: true
    },
    amount: Number,
    unit: {
      type: String,
      default: 'گرم'
    },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  }],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  notes: String,
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// محاسبه جمع کل قبل از ذخیره
FoodLogSchema.pre('save', function(next) {
  this.totalCalories = this.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
  this.totalProtein = this.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
  this.totalCarbs = this.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  this.totalFat = this.foods.reduce((sum, food) => sum + (food.fat || 0), 0);
  next();
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
