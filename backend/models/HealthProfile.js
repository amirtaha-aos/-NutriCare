const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  diagnosedDate: {
    type: Date,
    required: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild',
  },
  notes: String,
});

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  notes: String,
});

const allergySchema = new mongoose.Schema({
  allergen: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'mild',
  },
  reaction: String,
});

const labTestSchema = new mongoose.Schema({
  testType: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  results: mongoose.Schema.Types.Mixed,
  notes: String,
});

const healthProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Calculated metrics
  bmi: {
    type: Number,
    min: 0,
  },
  bmr: {
    type: Number,
    min: 0,
  },
  tdee: {
    type: Number,
    min: 0,
  },
  lastCalculated: Date,

  // Medical information
  diseases: [diseaseSchema],
  medications: [medicationSchema],
  allergies: [allergySchema],
  labTests: [labTestSchema],
}, {
  timestamps: true,
});

// Indexes
healthProfileSchema.index({ userId: 1 });
healthProfileSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
