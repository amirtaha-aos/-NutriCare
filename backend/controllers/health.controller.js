const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const calculationService = require('../services/calculation.service');
const drugInteractionService = require('../services/drugInteraction.service');
const labAnalysisService = require('../services/labAnalysis.service');

class HealthController {
  // Get health profile
  async getProfile(req, res) {
    try {
      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        // Create default profile if doesn't exist
        profile = new HealthProfile({
          userId: req.userId,
          diseases: [],
          medications: [],
          allergies: [],
          labTests: [],
        });
        await profile.save();
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get health profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch health profile'
      });
    }
  }

  // Update health profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;

      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        profile = new HealthProfile({
          userId: req.userId,
          ...updates
        });
      } else {
        Object.assign(profile, updates);
      }

      await profile.save();

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Update health profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update health profile'
      });
    }
  }

  // Add disease
  async addDisease(req, res) {
    try {
      const { name, diagnosedDate, severity, notes } = req.body;

      if (!name || !diagnosedDate) {
        return res.status(400).json({
          success: false,
          message: 'Name and diagnosed date are required'
        });
      }

      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        profile = new HealthProfile({ userId: req.userId });
      }

      profile.diseases.push({ name, diagnosedDate, severity, notes });
      await profile.save();

      res.json({
        success: true,
        data: profile.diseases[profile.diseases.length - 1]
      });
    } catch (error) {
      console.error('Add disease error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add disease'
      });
    }
  }

  // Update disease
  async updateDisease(req, res) {
    try {
      const { diseaseId } = req.params;
      const updates = req.body;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      const disease = profile.diseases.id(diseaseId);
      if (!disease) {
        return res.status(404).json({
          success: false,
          message: 'Disease not found'
        });
      }

      Object.assign(disease, updates);
      await profile.save();

      res.json({
        success: true,
        data: disease
      });
    } catch (error) {
      console.error('Update disease error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update disease'
      });
    }
  }

  // Delete disease
  async deleteDisease(req, res) {
    try {
      const { diseaseId } = req.params;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      profile.diseases.id(diseaseId).remove();
      await profile.save();

      res.json({
        success: true,
        message: 'Disease deleted successfully'
      });
    } catch (error) {
      console.error('Delete disease error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete disease'
      });
    }
  }

  // Add medication
  async addMedication(req, res) {
    try {
      const { name, dosage, frequency, startDate, endDate, notes } = req.body;

      if (!name || !dosage || !frequency || !startDate) {
        return res.status(400).json({
          success: false,
          message: 'Name, dosage, frequency, and start date are required'
        });
      }

      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        profile = new HealthProfile({ userId: req.userId });
      }

      profile.medications.push({ name, dosage, frequency, startDate, endDate, notes });
      await profile.save();

      res.json({
        success: true,
        data: profile.medications[profile.medications.length - 1]
      });
    } catch (error) {
      console.error('Add medication error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add medication'
      });
    }
  }

  // Update medication
  async updateMedication(req, res) {
    try {
      const { medicationId } = req.params;
      const updates = req.body;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      const medication = profile.medications.id(medicationId);
      if (!medication) {
        return res.status(404).json({
          success: false,
          message: 'Medication not found'
        });
      }

      Object.assign(medication, updates);
      await profile.save();

      res.json({
        success: true,
        data: medication
      });
    } catch (error) {
      console.error('Update medication error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update medication'
      });
    }
  }

  // Delete medication
  async deleteMedication(req, res) {
    try {
      const { medicationId } = req.params;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      profile.medications.id(medicationId).remove();
      await profile.save();

      res.json({
        success: true,
        message: 'Medication deleted successfully'
      });
    } catch (error) {
      console.error('Delete medication error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete medication'
      });
    }
  }

  // Add allergy
  async addAllergy(req, res) {
    try {
      const { allergen, severity, reaction } = req.body;

      if (!allergen) {
        return res.status(400).json({
          success: false,
          message: 'Allergen is required'
        });
      }

      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        profile = new HealthProfile({ userId: req.userId });
      }

      profile.allergies.push({ allergen, severity, reaction });
      await profile.save();

      res.json({
        success: true,
        data: profile.allergies[profile.allergies.length - 1]
      });
    } catch (error) {
      console.error('Add allergy error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add allergy'
      });
    }
  }

  // Delete allergy
  async deleteAllergy(req, res) {
    try {
      const { allergyId } = req.params;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      profile.allergies.id(allergyId).remove();
      await profile.save();

      res.json({
        success: true,
        message: 'Allergy deleted successfully'
      });
    } catch (error) {
      console.error('Delete allergy error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete allergy'
      });
    }
  }

  // Calculate health metrics
  async calculateMetrics(req, res) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.weight || !user.height || !user.age || !user.gender) {
        return res.status(400).json({
          success: false,
          message: 'Weight, height, age, and gender are required for calculation'
        });
      }

      const metrics = calculationService.calculateAllMetrics({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel
      });

      // Update health profile with calculated metrics
      let profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        profile = new HealthProfile({ userId: req.userId });
      }

      profile.bmi = metrics.bmi;
      profile.bmr = metrics.bmr;
      profile.tdee = metrics.tdee;
      profile.lastCalculated = metrics.lastCalculated;

      await profile.save();

      res.json({
        success: true,
        data: {
          bmi: metrics.bmi,
          bmiCategory: metrics.bmiCategory,
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          lastCalculated: metrics.lastCalculated
        }
      });
    } catch (error) {
      console.error('Calculate metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate metrics'
      });
    }
  }

  // Get health metrics
  async getMetrics(req, res) {
    try {
      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile || !profile.bmi) {
        return res.status(404).json({
          success: false,
          message: 'Metrics not calculated yet. Please calculate first.'
        });
      }

      const bmiCategory = calculationService.getBMICategory(profile.bmi);

      res.json({
        success: true,
        data: {
          bmi: profile.bmi,
          bmiCategory,
          bmr: profile.bmr,
          tdee: profile.tdee,
          lastCalculated: profile.lastCalculated
        }
      });
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch metrics'
      });
    }
  }

  // Check drug interactions
  async checkDrugInteractions(req, res) {
    try {
      const profile = await HealthProfile.findOne({ userId: req.userId });
      const user = await User.findById(req.userId);

      if (!profile || !profile.medications || profile.medications.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No medications found to analyze'
        });
      }

      // Analyze drug interactions
      const analysis = await drugInteractionService.checkInteractions(
        profile.medications,
        profile.diseases || [],
        {
          age: user.age,
          weight: user.weight,
          gender: user.gender
        }
      );

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Drug interaction check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check drug interactions'
      });
    }
  }

  // Get medication information
  async getMedicationInfo(req, res) {
    try {
      const { medicationName } = req.params;

      if (!medicationName) {
        return res.status(400).json({
          success: false,
          message: 'Medication name is required'
        });
      }

      const info = await drugInteractionService.getMedicationInfo(medicationName);

      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      console.error('Get medication info error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get medication information'
      });
    }
  }

  // Add and analyze lab test
  async addLabTest(req, res) {
    try {
      const { testType, imageBase64, notes } = req.body;

      if (!testType || !imageBase64) {
        return res.status(400).json({
          success: false,
          message: 'Test type and image are required'
        });
      }

      const profile = await HealthProfile.findOne({ userId: req.userId });
      const user = await User.findById(req.userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      // Analyze the lab image
      const analysis = await labAnalysisService.analyzeLabImage(
        imageBase64,
        testType,
        {
          age: user.age,
          gender: user.gender,
          weight: user.weight,
          diseases: profile.diseases,
          medications: profile.medications
        }
      );

      // Save the lab test with analysis results
      const labTest = {
        testType,
        testDate: new Date(),
        imageUrl: imageBase64, // In production, upload to S3 and store URL
        results: analysis,
        notes
      };

      profile.labTests.push(labTest);
      await profile.save();

      res.json({
        success: true,
        data: {
          labTest: profile.labTests[profile.labTests.length - 1],
          analysis
        }
      });
    } catch (error) {
      console.error('Add lab test error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add and analyze lab test'
      });
    }
  }

  // Get lab test analysis
  async getLabAnalysis(req, res) {
    try {
      const { labTestId } = req.params;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      const labTest = profile.labTests.id(labTestId);

      if (!labTest) {
        return res.status(404).json({
          success: false,
          message: 'Lab test not found'
        });
      }

      res.json({
        success: true,
        data: labTest
      });
    } catch (error) {
      console.error('Get lab analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get lab analysis'
      });
    }
  }

  // Analyze lab test trends
  async analyzeLabTrends(req, res) {
    try {
      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile || !profile.labTests || profile.labTests.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least 2 lab tests are required for trend analysis'
        });
      }

      const trendAnalysis = await labAnalysisService.analyzeTrends(profile.labTests);

      res.json({
        success: true,
        data: trendAnalysis
      });
    } catch (error) {
      console.error('Lab trend analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to analyze lab trends'
      });
    }
  }

  // Get personalized health insights
  async getHealthInsights(req, res) {
    try {
      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      // Get latest lab results
      const latestLab = profile.labTests && profile.labTests.length > 0
        ? profile.labTests[profile.labTests.length - 1].results
        : null;

      if (!latestLab) {
        return res.status(400).json({
          success: false,
          message: 'No lab results available for analysis'
        });
      }

      const insights = await labAnalysisService.getPersonalizedInsights(
        latestLab,
        profile
      );

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Get health insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get health insights'
      });
    }
  }

  // Delete lab test
  async deleteLabTest(req, res) {
    try {
      const { labTestId } = req.params;

      const profile = await HealthProfile.findOne({ userId: req.userId });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Health profile not found'
        });
      }

      profile.labTests.id(labTestId).remove();
      await profile.save();

      res.json({
        success: true,
        message: 'Lab test deleted successfully'
      });
    } catch (error) {
      console.error('Delete lab test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lab test'
      });
    }
  }
}

module.exports = new HealthController();
