const RuleEngine = require('../services/ruleEngine');
const Food = require('../models/Food');
const Medicine = require('../models/Medicine');
const LabRule = require('../models/LabRule');
const PredefinedMealPlan = require('../models/PredefinedMealPlan');
const HealthProfile = require('../models/HealthProfile');

/**
 * Get personalized health analysis and recommendations
 */
exports.getHealthAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const analysis = await RuleEngine.analyzeUserHealth(userId);

    if (analysis.error) {
      return res.status(404).json({
        success: false,
        message: analysis.error,
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error getting health analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing health data',
      error: error.message,
    });
  }
};

/**
 * Check medicine interactions
 */
exports.checkMedicineInteractions = async (req, res) => {
  try {
    const { medicines } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of medicine names',
      });
    }

    // Check drug-drug interactions
    const drugInteractions = await RuleEngine.checkDrugInteractions(medicines);

    // Get food interactions for each medicine
    const foodInteractions = [];
    for (const medName of medicines) {
      const medicine = await Medicine.findOne({
        $or: [
          { name: { $regex: medName, $options: 'i' } },
          { genericName: { $regex: medName, $options: 'i' } },
        ],
      });

      if (medicine && medicine.foodInteractions) {
        foodInteractions.push({
          medicine: medName,
          interactions: medicine.foodInteractions,
          dietaryRecommendations: medicine.dietaryRecommendations,
          warnings: medicine.warnings,
        });
      }
    }

    res.json({
      success: true,
      data: {
        drugInteractions,
        foodInteractions,
      },
    });
  } catch (error) {
    console.error('Error checking medicine interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking interactions',
      error: error.message,
    });
  }
};

/**
 * Interpret lab results
 */
exports.interpretLabResults = async (req, res) => {
  try {
    const { results } = req.body;

    if (!results || typeof results !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Please provide lab results object',
      });
    }

    const interpretations = [];

    for (const [testName, value] of Object.entries(results)) {
      if (typeof value !== 'number') continue;

      const rule = await LabRule.findOne({
        testName: { $regex: testName, $options: 'i' },
      });

      if (rule) {
        for (const interp of rule.interpretations) {
          if (value >= interp.range.min && value <= interp.range.max) {
            interpretations.push({
              test: testName,
              testNameFa: rule.testNameFa,
              value,
              unit: rule.unit,
              status: interp.condition,
              meaning: interp.meaning,
              meaningFa: interp.meaningFa,
              severity: interp.severity,
              possibleConditions: interp.possibleConditions,
              dietaryRecommendations: interp.dietaryRecommendations,
              normalRange: rule.normalRange,
            });
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      data: interpretations,
    });
  } catch (error) {
    console.error('Error interpreting lab results:', error);
    res.status(500).json({
      success: false,
      message: 'Error interpreting results',
      error: error.message,
    });
  }
};

/**
 * Get suggested meal plan based on conditions
 */
exports.getSuggestedMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const healthProfile = await HealthProfile.findOne({ userId });

    if (!healthProfile) {
      return res.status(404).json({
        success: false,
        message: 'Health profile not found',
      });
    }

    // Get conditions from diseases
    const conditions = healthProfile.diseases?.map(d =>
      RuleEngine.mapDiseaseToCondition(d.name)
    ).filter(c => c) || [];

    // Get medicines
    const medicines = healthProfile.medications?.map(m => m.name) || [];

    // Find matching meal plans
    const plans = await PredefinedMealPlan.find({
      isActive: true,
      $or: [
        { targetConditions: { $in: conditions } },
      ],
      incompatibleMedicines: { $nin: medicines },
    }).sort({ priority: -1 });

    res.json({
      success: true,
      data: {
        conditions,
        suggestedPlans: plans,
      },
    });
  } catch (error) {
    console.error('Error getting suggested meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting meal plan',
      error: error.message,
    });
  }
};

/**
 * Search foods with nutrition info
 */
exports.searchFoods = async (req, res) => {
  try {
    const { query, category, language = 'en' } = req.query;

    let filter = {};

    if (query) {
      const searchField = language === 'fa' ? 'nameFa' : 'name';
      filter[searchField] = { $regex: query, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    const foods = await Food.find(filter)
      .limit(50)
      .sort({ timesScanned: -1 });

    res.json({
      success: true,
      count: foods.length,
      data: foods,
    });
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching foods',
      error: error.message,
    });
  }
};

/**
 * Get food by barcode
 */
exports.getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const food = await Food.findByBarcode(barcode);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found for this barcode',
      });
    }

    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    console.error('Error getting food by barcode:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting food',
      error: error.message,
    });
  }
};

/**
 * Get all lab test types
 */
exports.getLabTestTypes = async (req, res) => {
  try {
    const labRules = await LabRule.find({}, 'testName testNameFa unit category normalRange');

    res.json({
      success: true,
      data: labRules,
    });
  } catch (error) {
    console.error('Error getting lab test types:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting lab tests',
      error: error.message,
    });
  }
};

/**
 * Search medicines
 */
exports.searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { nameFa: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
      ],
    }).limit(20);

    res.json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching medicines',
      error: error.message,
    });
  }
};

/**
 * Get all predefined meal plans
 */
exports.getPredefinedMealPlans = async (req, res) => {
  try {
    const { condition } = req.query;

    let filter = { isActive: true };
    if (condition) {
      filter.targetConditions = condition;
    }

    const plans = await PredefinedMealPlan.find(filter).sort({ priority: -1 });

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Error getting meal plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting meal plans',
      error: error.message,
    });
  }
};
