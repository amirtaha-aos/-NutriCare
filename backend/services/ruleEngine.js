const Medicine = require('../models/Medicine');
const LabRule = require('../models/LabRule');
const PredefinedMealPlan = require('../models/PredefinedMealPlan');
const HealthProfile = require('../models/HealthProfile');

/**
 * Rule Engine Service
 * Analyzes user health data and provides recommendations
 */
class RuleEngine {
  /**
   * Analyze user's complete health profile and generate recommendations
   */
  static async analyzeUserHealth(userId) {
    const healthProfile = await HealthProfile.findOne({ userId });
    if (!healthProfile) {
      return { error: 'Health profile not found' };
    }

    const analysis = {
      conditions: [],
      medicineWarnings: [],
      dietaryRecommendations: {
        avoid: [],
        limit: [],
        increase: [],
      },
      suggestedMealPlans: [],
      labInterpretations: [],
    };

    // Analyze medications
    if (healthProfile.medications && healthProfile.medications.length > 0) {
      const medicineAnalysis = await this.analyzeMedicines(healthProfile.medications);
      analysis.medicineWarnings = medicineAnalysis.warnings;
      analysis.dietaryRecommendations.avoid.push(...medicineAnalysis.avoid);
      analysis.dietaryRecommendations.limit.push(...medicineAnalysis.limit);
      analysis.dietaryRecommendations.increase.push(...medicineAnalysis.increase);
    }

    // Analyze diseases
    if (healthProfile.diseases && healthProfile.diseases.length > 0) {
      const diseaseConditions = healthProfile.diseases.map(d => this.mapDiseaseToCondition(d.name));
      analysis.conditions.push(...diseaseConditions.filter(c => c));
    }

    // Analyze lab results
    if (healthProfile.labTests && healthProfile.labTests.length > 0) {
      const labAnalysis = await this.analyzeLabResults(healthProfile.labTests);
      analysis.labInterpretations = labAnalysis.interpretations;
      analysis.conditions.push(...labAnalysis.conditions);
      analysis.dietaryRecommendations.avoid.push(...labAnalysis.avoid);
      analysis.dietaryRecommendations.increase.push(...labAnalysis.increase);
    }

    // Get suggested meal plans based on conditions
    analysis.suggestedMealPlans = await this.getSuggestedMealPlans(
      analysis.conditions,
      healthProfile.medications?.map(m => m.name) || []
    );

    // Remove duplicates
    analysis.conditions = [...new Set(analysis.conditions)];
    analysis.dietaryRecommendations.avoid = [...new Set(analysis.dietaryRecommendations.avoid)];
    analysis.dietaryRecommendations.limit = [...new Set(analysis.dietaryRecommendations.limit)];
    analysis.dietaryRecommendations.increase = [...new Set(analysis.dietaryRecommendations.increase)];

    return analysis;
  }

  /**
   * Analyze medicines and get food interactions
   */
  static async analyzeMedicines(medications) {
    const result = {
      warnings: [],
      avoid: [],
      limit: [],
      increase: [],
    };

    for (const med of medications) {
      const medicine = await Medicine.findOne({
        $or: [
          { name: { $regex: med.name, $options: 'i' } },
          { genericName: { $regex: med.name, $options: 'i' } },
        ],
      });

      if (medicine) {
        // Add food interactions
        if (medicine.foodInteractions) {
          for (const interaction of medicine.foodInteractions) {
            if (interaction.interaction === 'avoid') {
              result.avoid.push(interaction.food);
              result.warnings.push({
                medicine: med.name,
                type: 'food_interaction',
                food: interaction.food,
                message: interaction.description,
                messageFa: interaction.descriptionFa,
              });
            } else if (interaction.interaction === 'limit') {
              result.limit.push(interaction.food);
            }
          }
        }

        // Add dietary recommendations
        if (medicine.dietaryRecommendations) {
          result.avoid.push(...(medicine.dietaryRecommendations.avoid || []));
          result.limit.push(...(medicine.dietaryRecommendations.limit || []));
          result.increase.push(...(medicine.dietaryRecommendations.increase || []));

          if (medicine.dietaryRecommendations.timing) {
            result.warnings.push({
              medicine: med.name,
              type: 'timing',
              message: medicine.dietaryRecommendations.timing,
            });
          }
        }

        // Add general warnings
        if (medicine.warnings) {
          for (const warning of medicine.warnings) {
            result.warnings.push({
              medicine: med.name,
              type: 'general',
              message: warning,
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Analyze lab results and interpret them
   */
  static async analyzeLabResults(labTests) {
    const result = {
      interpretations: [],
      conditions: [],
      avoid: [],
      increase: [],
    };

    for (const test of labTests) {
      if (!test.results) continue;

      // Try to match test results with rules
      for (const [testName, value] of Object.entries(test.results)) {
        if (typeof value !== 'number') continue;

        const rule = await LabRule.findOne({
          testName: { $regex: testName, $options: 'i' },
        });

        if (rule) {
          // Find matching interpretation
          for (const interp of rule.interpretations) {
            if (value >= interp.range.min && value <= interp.range.max) {
              result.interpretations.push({
                test: testName,
                value,
                unit: rule.unit,
                status: interp.condition,
                meaning: interp.meaning,
                meaningFa: interp.meaningFa,
                severity: interp.severity,
              });

              // Add conditions
              if (interp.possibleConditions) {
                result.conditions.push(...interp.possibleConditions);
              }

              // Add dietary recommendations
              if (interp.dietaryRecommendations) {
                result.avoid.push(...(interp.dietaryRecommendations.avoid || []));
                result.increase.push(...(interp.dietaryRecommendations.increase || []));
              }

              break;
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get suggested meal plans based on conditions
   */
  static async getSuggestedMealPlans(conditions, medicines) {
    const plans = await PredefinedMealPlan.find({
      isActive: true,
      $or: [
        { targetConditions: { $in: conditions } },
        { 'labTriggers.testName': { $exists: true } },
      ],
      incompatibleMedicines: { $nin: medicines },
    }).sort({ priority: -1 });

    return plans.map(plan => ({
      id: plan._id,
      name: plan.name,
      nameFa: plan.nameFa,
      description: plan.description,
      descriptionFa: plan.descriptionFa,
      matchedConditions: plan.targetConditions.filter(c => conditions.includes(c)),
      nutritionGoals: plan.nutritionGoals,
      duration: plan.duration,
    }));
  }

  /**
   * Map disease name to condition code
   */
  static mapDiseaseToCondition(diseaseName) {
    const mapping = {
      'diabetes': 'diabetes_type2',
      'type 1 diabetes': 'diabetes_type1',
      'type 2 diabetes': 'diabetes_type2',
      'prediabetes': 'prediabetes',
      'high cholesterol': 'high_cholesterol',
      'hypercholesterolemia': 'high_cholesterol',
      'hypertension': 'high_blood_pressure',
      'high blood pressure': 'high_blood_pressure',
      'heart disease': 'heart_disease',
      'cardiovascular': 'heart_disease',
      'kidney disease': 'kidney_disease',
      'ckd': 'kidney_disease',
      'fatty liver': 'fatty_liver',
      'nafld': 'fatty_liver',
      'anemia': 'iron_deficiency',
      'iron deficiency': 'iron_deficiency',
      'hypothyroidism': 'hypothyroid',
      'hyperthyroidism': 'hyperthyroid',
      'gout': 'gout',
      'obesity': 'obesity',
    };

    const lowerName = diseaseName.toLowerCase();
    for (const [key, value] of Object.entries(mapping)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Check drug-drug interactions
   */
  static async checkDrugInteractions(medications) {
    const interactions = [];

    for (let i = 0; i < medications.length; i++) {
      const med1 = await Medicine.findOne({
        $or: [
          { name: { $regex: medications[i], $options: 'i' } },
          { genericName: { $regex: medications[i], $options: 'i' } },
        ],
      });

      if (med1 && med1.drugInteractions) {
        for (const interaction of med1.drugInteractions) {
          for (let j = i + 1; j < medications.length; j++) {
            if (
              medications[j].toLowerCase().includes(interaction.drug.toLowerCase()) ||
              interaction.drug.toLowerCase().includes(medications[j].toLowerCase())
            ) {
              interactions.push({
                drug1: medications[i],
                drug2: medications[j],
                severity: interaction.severity,
                description: interaction.description,
              });
            }
          }
        }
      }
    }

    return interactions;
  }
}

module.exports = RuleEngine;
