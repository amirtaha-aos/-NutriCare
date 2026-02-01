const Food = require('../models/Food');

/**
 * Search foods by name
 * GET /api/foods/search?query=...&category=...&page=...&limit=...
 */
exports.searchFoods = async (req, res) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query;

    const searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { nameFa: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) {
      searchQuery.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [foods, total] = await Promise.all([
      Food.find(searchQuery)
        .sort({ timesScanned: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Food.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      data: foods,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get food by ID
 * GET /api/foods/:foodId
 */
exports.getFoodById = async (req, res) => {
  try {
    const { foodId } = req.params;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Error getting food:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get food by barcode
 * GET /api/foods/barcode/:barcode
 */
exports.getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const food = await Food.findByBarcode(barcode);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found for this barcode'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Error getting food by barcode:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get popular foods
 * GET /api/foods/popular?category=...&limit=...
 */
exports.getPopularFoods = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;

    const foods = await Food.getPopularFoods(category, parseInt(limit));

    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Error getting popular foods:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get food categories
 * GET /api/foods/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Food.distinct('category');

    const categoryInfo = {
      fruits: { name: 'Fruits', nameFa: 'میوه‌ها', icon: 'food-apple' },
      vegetables: { name: 'Vegetables', nameFa: 'سبزیجات', icon: 'leaf' },
      grains: { name: 'Grains', nameFa: 'غلات', icon: 'barley' },
      protein: { name: 'Protein', nameFa: 'پروتئین', icon: 'food-steak' },
      dairy: { name: 'Dairy', nameFa: 'لبنیات', icon: 'cheese' },
      snacks: { name: 'Snacks', nameFa: 'تنقلات', icon: 'cookie' },
      beverages: { name: 'Beverages', nameFa: 'نوشیدنی‌ها', icon: 'cup' },
      sweets: { name: 'Sweets', nameFa: 'شیرینی‌ها', icon: 'candy' },
      oils: { name: 'Oils & Fats', nameFa: 'روغن‌ها', icon: 'bottle-tonic' },
      condiments: { name: 'Condiments', nameFa: 'چاشنی‌ها', icon: 'shaker' },
      prepared: { name: 'Prepared Foods', nameFa: 'غذاهای آماده', icon: 'food' },
      other: { name: 'Other', nameFa: 'سایر', icon: 'dots-horizontal' }
    };

    res.json({
      success: true,
      data: categories.map(cat => ({
        id: cat,
        ...categoryInfo[cat]
      }))
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
