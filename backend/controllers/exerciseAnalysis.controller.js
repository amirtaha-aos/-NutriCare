const exerciseAnalysisService = require('../services/exerciseAnalysis.service');
const poseDetectionService = require('../services/poseDetection.service');
const User = require('../models/User');

/**
 * Analyze single frame for exercise form
 */
exports.analyzeForm = async (req, res) => {
  try {
    const { imageBase64, exerciseType, repCount } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    if (!exerciseType) {
      return res.status(400).json({
        success: false,
        message: 'Exercise type is required',
      });
    }

    const result = await exerciseAnalysisService.analyzeExerciseForm(
      imageBase64,
      exerciseType,
      repCount || 0
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analyze form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze exercise form',
      error: error.message,
    });
  }
};

/**
 * Analyze complete exercise set
 */
exports.analyzeSet = async (req, res) => {
  try {
    const { frames, exerciseType } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Frames array is required',
      });
    }

    if (!exerciseType) {
      return res.status(400).json({
        success: false,
        message: 'Exercise type is required',
      });
    }

    const result = await exerciseAnalysisService.analyzeExerciseSet(frames, exerciseType);

    // Save to user's exercise history
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          'healthProfile.exerciseHistory': {
            exerciseType,
            ...result.analysis,
            date: new Date(),
          },
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analyze set error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze exercise set',
      error: error.message,
    });
  }
};

/**
 * Detect rep completion between frames
 */
exports.detectRep = async (req, res) => {
  try {
    const { previousFrame, currentFrame, exerciseType, currentPhase } = req.body;

    if (!previousFrame || !currentFrame) {
      return res.status(400).json({
        success: false,
        message: 'Both previous and current frames are required',
      });
    }

    const result = await exerciseAnalysisService.detectRepCompletion(
      previousFrame,
      currentFrame,
      exerciseType,
      currentPhase
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Detect rep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect rep',
      error: error.message,
    });
  }
};

/**
 * Get exercise guidance and tips
 */
exports.getGuidance = async (req, res) => {
  try {
    const { exerciseType } = req.params;

    const result = await exerciseAnalysisService.getExerciseGuidance(exerciseType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get guidance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise guidance',
      error: error.message,
    });
  }
};

/**
 * Get available exercises
 */
exports.getExercises = async (req, res) => {
  try {
    const exercises = exerciseAnalysisService.getAvailableExercises();

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercises',
      error: error.message,
    });
  }
};

/**
 * Save workout session
 */
exports.saveWorkout = async (req, res) => {
  try {
    const { exercises, duration } = req.body;

    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'Exercises array is required',
      });
    }

    const result = await exerciseAnalysisService.generateWorkoutSummary({
      exercises,
      duration: duration || 0,
      userId: req.user?._id,
    });

    // Save to user's workout history
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          'healthProfile.workoutHistory': {
            ...result,
            date: new Date(),
          },
        },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Save workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save workout',
      error: error.message,
    });
  }
};

/**
 * Get user's workout history
 */
exports.getWorkoutHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('healthProfile.workoutHistory');

    const history = user?.healthProfile?.workoutHistory || [];

    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: history.slice(0, 50), // Last 50 workouts
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workout history',
      error: error.message,
    });
  }
};

/**
 * Analyze position and check if user is ready
 */
exports.analyzePosition = async (req, res) => {
  try {
    const { frame, exerciseType, sessionState } = req.body;

    if (!frame) {
      return res.status(400).json({
        success: false,
        message: 'Frame is required',
      });
    }

    // Simulate pose detection (in production, use MediaPipe/TensorFlow)
    // For now, return mock data that simulates real behavior
    const mockLandmarks = generateMockLandmarks();

    const positioning = poseDetectionService.checkPositioning(mockLandmarks, exerciseType);
    const gesture = poseDetectionService.detectGesture(mockLandmarks);

    res.json({
      success: true,
      data: {
        positioning,
        gesture,
        sessionState,
      },
    });
  } catch (error) {
    console.error('Analyze position error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze position',
      error: error.message,
    });
  }
};

/**
 * Analyze rep during exercise
 */
exports.analyzeRep = async (req, res) => {
  try {
    const { frame, exerciseType, currentStats } = req.body;

    if (!frame) {
      return res.status(400).json({
        success: false,
        message: 'Frame is required',
      });
    }

    // Simulate pose detection
    const mockLandmarks = generateMockLandmarks();

    const analysis = poseDetectionService.analyzeFrame(mockLandmarks, exerciseType);
    const gesture = poseDetectionService.detectGesture(mockLandmarks);

    res.json({
      success: true,
      data: {
        ...analysis,
        gesture,
      },
    });
  } catch (error) {
    console.error('Analyze rep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze rep',
      error: error.message,
    });
  }
};

/**
 * Reset exercise session
 */
exports.resetSession = async (req, res) => {
  try {
    poseDetectionService.resetSession();

    res.json({
      success: true,
      message: 'Session reset successfully',
    });
  } catch (error) {
    console.error('Reset session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset session',
      error: error.message,
    });
  }
};

/**
 * Generate mock landmarks for testing
 * In production, this would be replaced with actual pose detection
 */
function generateMockLandmarks() {
  const landmarks = [];

  // Generate 33 landmarks with random but realistic positions
  for (let i = 0; i < 33; i++) {
    landmarks.push({
      x: 0.3 + Math.random() * 0.4, // Center of frame
      y: 0.1 + (i / 33) * 0.8, // Spread vertically
      z: Math.random() * 0.1,
      visibility: 0.7 + Math.random() * 0.3,
    });
  }

  // Adjust key landmarks for more realistic positions
  // Shoulders
  landmarks[11] = { x: 0.35, y: 0.25, z: 0, visibility: 0.95 };
  landmarks[12] = { x: 0.65, y: 0.25, z: 0, visibility: 0.95 };
  // Hips
  landmarks[23] = { x: 0.40, y: 0.50, z: 0, visibility: 0.90 };
  landmarks[24] = { x: 0.60, y: 0.50, z: 0, visibility: 0.90 };
  // Knees
  landmarks[25] = { x: 0.38, y: 0.70, z: 0, visibility: 0.85 };
  landmarks[26] = { x: 0.62, y: 0.70, z: 0, visibility: 0.85 };
  // Ankles
  landmarks[27] = { x: 0.38, y: 0.90, z: 0, visibility: 0.80 };
  landmarks[28] = { x: 0.62, y: 0.90, z: 0, visibility: 0.80 };

  return landmarks;
}
