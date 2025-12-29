const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

WeightLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
