const mongoose = require('mongoose');

/**
 * Medicine Schema
 * Database of common medicines with interactions and dietary recommendations
 */
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    nameFa: {
      type: String,
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'cardiovascular',
        'diabetes',
        'antibiotics',
        'pain_relief',
        'antidepressants',
        'blood_pressure',
        'cholesterol',
        'thyroid',
        'digestive',
        'respiratory',
        'vitamins',
        'other',
      ],
      default: 'other',
    },
    // Food interactions
    foodInteractions: [
      {
        food: String,
        interaction: {
          type: String,
          enum: ['avoid', 'limit', 'caution', 'timing'],
        },
        description: String,
        descriptionFa: String,
      },
    ],
    // Drug interactions
    drugInteractions: [
      {
        drug: String,
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe', 'contraindicated'],
        },
        description: String,
      },
    ],
    // Dietary recommendations while on this medicine
    dietaryRecommendations: {
      avoid: [String],
      limit: [String],
      increase: [String],
      timing: String, // e.g., "Take with food", "Take on empty stomach"
    },
    // Side effects that affect nutrition
    nutritionalSideEffects: [
      {
        effect: String,
        recommendation: String,
      },
    ],
    // Common conditions this medicine treats
    treatsConditions: [String],
    // Warnings
    warnings: [String],
    warningsFa: [String],
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ name: 'text', nameFa: 'text', genericName: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
