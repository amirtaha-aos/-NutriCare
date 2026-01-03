import { Request, Response } from 'express';
import aiService from '../services/aiService';

// @desc    Chat with AI
// @route   POST /api/v2/ai/chat
// @access  Public
export const chat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const response = await aiService.chat(message);

    res.json({
      success: true,
      response,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};

// @desc    Analyze food image
// @route   POST /api/v2/ai/analyze-food
// @access  Public
export const analyzeFood = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required',
      });
    }

    // Remove base64 prefix if exists
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const data = await aiService.analyzeFood(base64Data);

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Food analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};

// @desc    Analyze lab test
// @route   POST /api/v2/ai/analyze-lab-test
// @access  Public
export const analyzeLabTest = async (req: Request, res: Response) => {
  try {
    const { testData, testType } = req.body;

    if (!testData) {
      return res.status(400).json({
        success: false,
        error: 'Test data is required',
      });
    }

    const analysis = await aiService.analyzeLabTest({ testData, testType });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Lab test analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};

// @desc    Analyze drug interactions
// @route   POST /api/v2/ai/analyze-medications
// @access  Public
export const analyzeMedications = async (req: Request, res: Response) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        error: 'Medications array is required',
      });
    }

    const analysis = await aiService.analyzeDrugs(medications);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Medication analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};

// @desc    Generate meal plan
// @route   POST /api/v2/ai/generate-meal-plan
// @access  Public
export const generateMealPlan = async (req: Request, res: Response) => {
  try {
    const { weight, height, age, gender, goal, activityLevel, allergies, preferences, conditions } = req.body;

    if (!weight || !height || !age || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Weight, height, age, and gender are required',
      });
    }

    const mealPlan = await aiService.generateMealPlan({
      weight,
      height,
      age,
      gender,
      goal: goal || 'maintenance',
      activityLevel: activityLevel || 'moderate',
      allergies: allergies || [],
      preferences: preferences || [],
      conditions: conditions || [],
    });

    res.json({
      success: true,
      data: mealPlan,
    });
  } catch (error: any) {
    console.error('Meal plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};

// @desc    Health and BMI analysis
// @route   POST /api/v2/ai/health-analysis
// @access  Public
export const healthAnalysis = async (req: Request, res: Response) => {
  try {
    const { weight, height, age, gender } = req.body;

    if (!weight || !height || !age || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Weight, height, age, and gender are required',
      });
    }

    const analysis = await aiService.analyzeHealth({
      weight,
      height,
      age,
      gender,
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error('Health analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service error',
    });
  }
};
