const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // اطلاعات شخصی
  birthDate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  // اطلاعات فیزیکی
  height: {
    type: Number, // سانتی‌متر
  },
  weight: {
    type: Number, // کیلوگرم
  },
  targetWeight: {
    type: Number
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    default: 'moderate'
  },
  // سابقه پزشکی
  medicalConditions: [{
    type: String
  }],
  allergies: [{
    type: String
  }],
  medications: [{
    name: String,
    dosage: String
  }],
  // تاریخچه وزن
  weightHistory: [{
    weight: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // تنظیمات تغذیه
  dietaryPreferences: {
    type: String,
    enum: ['normal', 'vegetarian', 'vegan', 'keto', 'low_carb', 'diabetic'],
    default: 'normal'
  },
  dailyCalorieGoal: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// محاسبه BMI
PatientSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// محاسبه سن
PatientSchema.virtual('age').get(function() {
  if (this.birthDate) {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

PatientSchema.set('toJSON', { virtuals: true });
PatientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', PatientSchema);
