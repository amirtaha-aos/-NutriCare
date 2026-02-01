const mongoose = require('mongoose');

/**
 * Food Schema
 * Database of common foods for quick lookup and barcode scanning
 */
const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    nameFa: {
      type: String, // Persian name
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true, // Allow null but enforce uniqueness when present
      index: true,
    },
    category: {
      type: String,
      enum: [
        'fruits',
        'vegetables',
        'grains',
        'protein',
        'dairy',
        'snacks',
        'beverages',
        'sweets',
        'oils',
        'condiments',
        'prepared',
        'other',
      ],
      default: 'other',
      index: true,
    },
    // Nutritional information per 100g
    nutritionPer100g: {
      calories: {
        type: Number,
        required: true,
        min: 0,
      },
      protein: {
        type: Number,
        required: true,
        min: 0,
      },
      carbs: {
        type: Number,
        required: true,
        min: 0,
      },
      fats: {
        type: Number,
        required: true,
        min: 0,
      },
      fiber: {
        type: Number,
        default: 0,
        min: 0,
      },
      sugar: {
        type: Number,
        default: 0,
        min: 0,
      },
      sodium: {
        type: Number,
        default: 0,
        min: 0,
      },
      saturatedFat: {
        type: Number,
        default: 0,
        min: 0,
      },
      transFat: {
        type: Number,
        default: 0,
        min: 0,
      },
      cholesterol: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    // Serving size info
    servingSize: {
      amount: Number,
      unit: String, // g, ml, cup, piece, etc.
      description: String, // e.g., "1 medium apple", "1 slice"
    },
    // Common allergens
    allergens: [
      {
        type: String,
        enum: [
          'milk',
          'eggs',
          'fish',
          'shellfish',
          'tree nuts',
          'peanuts',
          'wheat',
          'soybeans',
          'sesame',
          'gluten',
        ],
      },
    ],
    // Additional info
    ingredients: [String], // List of ingredients
    additives: [String], // E-numbers, preservatives, etc.
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    isDairyFree: {
      type: Boolean,
      default: false,
    },
    // Data source
    source: {
      type: String,
      enum: ['user_input', 'ai_generated', 'database', 'barcode_api'],
      default: 'database',
    },
    // Usage tracking
    timesScanned: {
      type: Number,
      default: 0,
    },
    lastScanned: {
      type: Date,
    },
    // Admin/moderation
    isVerified: {
      type: Boolean,
      default: false, // Admin verified
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and lookup
foodSchema.index({ name: 'text', nameFa: 'text' }); // Text search
foodSchema.index({ category: 1, name: 1 }); // Category browsing
foodSchema.index({ barcode: 1 }); // Barcode lookup
foodSchema.index({ timesScanned: -1 }); // Popular foods

// Static method: Search foods by name
foodSchema.statics.searchByName = async function (query, language = 'en') {
  const searchField = language === 'fa' ? 'nameFa' : 'name';

  return this.find({
    [searchField]: { $regex: query, $options: 'i' },
  })
    .limit(20)
    .sort({ timesScanned: -1 });
};

// Static method: Find by barcode
foodSchema.statics.findByBarcode = async function (barcode) {
  const food = await this.findOne({ barcode });

  if (food) {
    // Update scan statistics
    food.timesScanned += 1;
    food.lastScanned = new Date();
    await food.save();
  }

  return food;
};

// Static method: Get popular foods
foodSchema.statics.getPopularFoods = async function (category = null, limit = 20) {
  const query = category ? { category } : {};

  return this.find(query).sort({ timesScanned: -1 }).limit(limit);
};

// Static method: Calculate nutrition for specific weight
foodSchema.methods.calculateNutrition = function (grams) {
  const multiplier = grams / 100;

  return {
    grams,
    calories: Math.round(this.nutritionPer100g.calories * multiplier),
    protein: Math.round(this.nutritionPer100g.protein * multiplier * 10) / 10,
    carbs: Math.round(this.nutritionPer100g.carbs * multiplier * 10) / 10,
    fats: Math.round(this.nutritionPer100g.fats * multiplier * 10) / 10,
    fiber: Math.round(this.nutritionPer100g.fiber * multiplier * 10) / 10,
    sugar: Math.round(this.nutritionPer100g.sugar * multiplier * 10) / 10,
    sodium: Math.round(this.nutritionPer100g.sodium * multiplier),
  };
};

// Pre-save middleware: Ensure at least one name is present
foodSchema.pre('save', function (next) {
  if (!this.name && !this.nameFa) {
    next(new Error('Food must have at least a name or Persian name'));
  }
  next();
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
