const mongoose = require('mongoose');

/**
 * Lab Rule Schema
 * Rules for interpreting lab results and suggesting dietary changes
 */
const labRuleSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: true,
      index: true,
    },
    testNameFa: String,
    unit: String,
    // Normal ranges
    normalRange: {
      min: Number,
      max: Number,
      gender: {
        type: String,
        enum: ['male', 'female', 'both'],
        default: 'both',
      },
    },
    // Interpretation rules
    interpretations: [
      {
        condition: {
          type: String,
          enum: ['low', 'normal', 'high', 'very_high', 'very_low'],
        },
        range: {
          min: Number,
          max: Number,
        },
        meaning: String,
        meaningFa: String,
        severity: {
          type: String,
          enum: ['normal', 'mild', 'moderate', 'severe'],
        },
        // Possible conditions when this result is seen
        possibleConditions: [String],
        // Dietary recommendations
        dietaryRecommendations: {
          increase: [String],
          decrease: [String],
          avoid: [String],
        },
        // Suggested meal plan type
        suggestedMealPlanType: String,
      },
    ],
    // Related tests that should be checked together
    relatedTests: [String],
    // Category
    category: {
      type: String,
      enum: [
        'blood_sugar',
        'lipid_profile',
        'liver',
        'kidney',
        'thyroid',
        'blood_count',
        'vitamins',
        'minerals',
        'hormones',
        'inflammation',
        'other',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const LabRule = mongoose.model('LabRule', labRuleSchema);

module.exports = LabRule;
