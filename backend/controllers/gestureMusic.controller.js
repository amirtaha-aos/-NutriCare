const gestureMusicService = require('../services/gestureMusic.service');

/**
 * Analyze hand gesture from frame
 */
exports.analyzeGesture = async (req, res) => {
  try {
    const { frame, mockGesture } = req.body;

    // For testing, use mock landmarks
    // In production, you would process the actual frame
    let landmarks;
    if (mockGesture) {
      landmarks = gestureMusicService.generateMockHandLandmarks(mockGesture);
    } else {
      // Simulate random gesture detection for testing
      const gestures = ['fist', 'open_palm', 'thumbs_up', 'point_right', 'random'];
      const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
      landmarks = gestureMusicService.generateMockHandLandmarks(randomGesture);
    }

    const { gesture, confidence } = gestureMusicService.detectGesture(landmarks);
    const musicAction = gestureMusicService.processGestureForMusic(gesture);

    res.json({
      success: true,
      data: {
        gesture,
        confidence,
        action: musicAction.action,
        message: musicAction.message,
      },
    });
  } catch (error) {
    console.error('Analyze gesture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze gesture',
      error: error.message,
    });
  }
};

/**
 * Get available gestures
 */
exports.getGestures = async (req, res) => {
  try {
    const gestures = gestureMusicService.getAvailableGestures();

    res.json({
      success: true,
      data: gestures,
    });
  } catch (error) {
    console.error('Get gestures error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gestures',
      error: error.message,
    });
  }
};

/**
 * Reset gesture session
 */
exports.resetSession = async (req, res) => {
  try {
    gestureMusicService.resetSession();

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
 * Test specific gesture (for development)
 */
exports.testGesture = async (req, res) => {
  try {
    const { gestureType } = req.params;

    const landmarks = gestureMusicService.generateMockHandLandmarks(gestureType);
    const { gesture, confidence } = gestureMusicService.detectGesture(landmarks);
    const musicAction = gestureMusicService.processGestureForMusic(gesture);

    res.json({
      success: true,
      data: {
        requestedGesture: gestureType,
        detectedGesture: gesture,
        confidence,
        action: musicAction.action,
        message: musicAction.message,
      },
    });
  } catch (error) {
    console.error('Test gesture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test gesture',
      error: error.message,
    });
  }
};
