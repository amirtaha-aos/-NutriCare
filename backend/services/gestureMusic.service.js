/**
 * Gesture Music Control Service
 * Detects hand gestures for music playback control
 */

// MediaPipe hand landmark indices
const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// Gesture types
const GESTURES = {
  NONE: 'none',
  FIST: 'fist',           // Play/Resume
  OPEN_PALM: 'open_palm', // Pause
  POINT_RIGHT: 'point_right', // Next track
  POINT_LEFT: 'point_left',   // Previous track
  THUMBS_UP: 'thumbs_up',     // Volume up
  THUMBS_DOWN: 'thumbs_down', // Volume down
  PEACE: 'peace',             // Shuffle
  OK_SIGN: 'ok_sign',         // Repeat
};

// Session state for gesture stability
let lastGesture = GESTURES.NONE;
let gestureStartTime = null;
let gestureConfirmCount = 0;
const GESTURE_CONFIRM_THRESHOLD = 3; // Need 3 consecutive same gestures
const GESTURE_COOLDOWN = 1000; // 1 second cooldown between actions

let lastActionTime = 0;

/**
 * Check if a finger is extended
 */
function isFingerExtended(landmarks, fingerTip, fingerPip, fingerMcp) {
  const tip = landmarks[fingerTip];
  const pip = landmarks[fingerPip];
  const mcp = landmarks[fingerMcp];

  if (!tip || !pip || !mcp) return false;

  // Finger is extended if tip is further from wrist than pip
  const tipDist = Math.sqrt(
    Math.pow(tip.x - landmarks[HAND_LANDMARKS.WRIST].x, 2) +
    Math.pow(tip.y - landmarks[HAND_LANDMARKS.WRIST].y, 2)
  );
  const pipDist = Math.sqrt(
    Math.pow(pip.x - landmarks[HAND_LANDMARKS.WRIST].x, 2) +
    Math.pow(pip.y - landmarks[HAND_LANDMARKS.WRIST].y, 2)
  );

  return tipDist > pipDist * 1.1;
}

/**
 * Check if thumb is extended
 */
function isThumbExtended(landmarks) {
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const thumbMcp = landmarks[HAND_LANDMARKS.THUMB_MCP];
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_MCP];

  if (!thumbTip || !thumbMcp || !indexMcp) return false;

  // Check horizontal distance from thumb tip to index base
  const horizontalDist = Math.abs(thumbTip.x - indexMcp.x);
  return horizontalDist > 0.1;
}

/**
 * Detect thumb direction (up/down)
 */
function getThumbDirection(landmarks) {
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const thumbMcp = landmarks[HAND_LANDMARKS.THUMB_MCP];
  const wrist = landmarks[HAND_LANDMARKS.WRIST];

  if (!thumbTip || !thumbMcp || !wrist) return 'neutral';

  // Check if thumb is pointing up or down relative to wrist
  if (thumbTip.y < thumbMcp.y - 0.05 && thumbTip.y < wrist.y - 0.1) {
    return 'up';
  } else if (thumbTip.y > thumbMcp.y + 0.05 && thumbTip.y > wrist.y) {
    return 'down';
  }

  return 'neutral';
}

/**
 * Detect pointing direction
 */
function getPointingDirection(landmarks) {
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
  const indexMcp = landmarks[HAND_LANDMARKS.INDEX_MCP];
  const wrist = landmarks[HAND_LANDMARKS.WRIST];

  if (!indexTip || !indexMcp || !wrist) return 'neutral';

  const dx = indexTip.x - indexMcp.x;

  if (dx > 0.08) return 'right';
  if (dx < -0.08) return 'left';

  return 'neutral';
}

/**
 * Main gesture detection function
 */
function detectGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: GESTURES.NONE, confidence: 0 };
  }

  // Check finger states
  const indexExtended = isFingerExtended(
    landmarks,
    HAND_LANDMARKS.INDEX_TIP,
    HAND_LANDMARKS.INDEX_PIP,
    HAND_LANDMARKS.INDEX_MCP
  );
  const middleExtended = isFingerExtended(
    landmarks,
    HAND_LANDMARKS.MIDDLE_TIP,
    HAND_LANDMARKS.MIDDLE_PIP,
    HAND_LANDMARKS.MIDDLE_MCP
  );
  const ringExtended = isFingerExtended(
    landmarks,
    HAND_LANDMARKS.RING_TIP,
    HAND_LANDMARKS.RING_PIP,
    HAND_LANDMARKS.RING_MCP
  );
  const pinkyExtended = isFingerExtended(
    landmarks,
    HAND_LANDMARKS.PINKY_TIP,
    HAND_LANDMARKS.PINKY_PIP,
    HAND_LANDMARKS.PINKY_MCP
  );
  const thumbExtended = isThumbExtended(landmarks);

  const thumbDirection = getThumbDirection(landmarks);
  const pointingDirection = getPointingDirection(landmarks);

  // Count extended fingers (excluding thumb)
  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended]
    .filter(Boolean).length;

  let gesture = GESTURES.NONE;
  let confidence = 0;

  // Detect specific gestures

  // Fist - no fingers extended
  if (extendedCount === 0 && !thumbExtended) {
    gesture = GESTURES.FIST;
    confidence = 0.9;
  }
  // Open palm - all fingers extended
  else if (extendedCount >= 4 && thumbExtended) {
    gesture = GESTURES.OPEN_PALM;
    confidence = 0.9;
  }
  // Thumbs up - only thumb extended and pointing up
  else if (extendedCount === 0 && thumbExtended && thumbDirection === 'up') {
    gesture = GESTURES.THUMBS_UP;
    confidence = 0.85;
  }
  // Thumbs down - only thumb extended and pointing down
  else if (extendedCount === 0 && thumbExtended && thumbDirection === 'down') {
    gesture = GESTURES.THUMBS_DOWN;
    confidence = 0.85;
  }
  // Point right - only index extended, pointing right
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && pointingDirection === 'right') {
    gesture = GESTURES.POINT_RIGHT;
    confidence = 0.85;
  }
  // Point left - only index extended, pointing left
  else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && pointingDirection === 'left') {
    gesture = GESTURES.POINT_LEFT;
    confidence = 0.85;
  }
  // Peace sign - index and middle extended
  else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    gesture = GESTURES.PEACE;
    confidence = 0.8;
  }
  // OK sign - thumb and index form circle (simplified detection)
  else if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
    const indexTip = landmarks[HAND_LANDMARKS.INDEX_TIP];
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    if (distance < 0.05) {
      gesture = GESTURES.OK_SIGN;
      confidence = 0.75;
    }
  }

  return { gesture, confidence };
}

/**
 * Process gesture and determine music action
 */
function processGestureForMusic(detectedGesture) {
  const now = Date.now();

  // Check cooldown
  if (now - lastActionTime < GESTURE_COOLDOWN) {
    return { action: null, message: 'Cooldown active' };
  }

  // Gesture stability check
  if (detectedGesture === lastGesture) {
    gestureConfirmCount++;
  } else {
    gestureConfirmCount = 1;
    lastGesture = detectedGesture;
    gestureStartTime = now;
  }

  // Only trigger action after confirmed gestures
  if (gestureConfirmCount < GESTURE_CONFIRM_THRESHOLD) {
    return { action: null, message: 'Confirming gesture...' };
  }

  // Reset for next gesture
  gestureConfirmCount = 0;
  lastActionTime = now;

  // Map gesture to action
  const actionMap = {
    [GESTURES.FIST]: { action: 'play', message: 'Playing music' },
    [GESTURES.OPEN_PALM]: { action: 'pause', message: 'Paused' },
    [GESTURES.POINT_RIGHT]: { action: 'next', message: 'Next track' },
    [GESTURES.POINT_LEFT]: { action: 'previous', message: 'Previous track' },
    [GESTURES.THUMBS_UP]: { action: 'volume_up', message: 'Volume up' },
    [GESTURES.THUMBS_DOWN]: { action: 'volume_down', message: 'Volume down' },
    [GESTURES.PEACE]: { action: 'shuffle', message: 'Shuffle toggled' },
    [GESTURES.OK_SIGN]: { action: 'repeat', message: 'Repeat toggled' },
    [GESTURES.NONE]: { action: null, message: 'No gesture detected' },
  };

  return actionMap[detectedGesture] || { action: null, message: 'Unknown gesture' };
}

/**
 * Reset gesture session state
 */
function resetSession() {
  lastGesture = GESTURES.NONE;
  gestureStartTime = null;
  gestureConfirmCount = 0;
  lastActionTime = 0;
}

/**
 * Generate mock hand landmarks for testing
 */
function generateMockHandLandmarks(gestureType = 'random') {
  const landmarks = [];

  // Base hand position
  const baseX = 0.5;
  const baseY = 0.5;

  // Generate 21 hand landmarks
  for (let i = 0; i < 21; i++) {
    landmarks.push({
      x: baseX + (Math.random() - 0.5) * 0.3,
      y: baseY + (Math.random() - 0.5) * 0.3,
      z: Math.random() * 0.1,
      visibility: 0.8 + Math.random() * 0.2,
    });
  }

  // Adjust landmarks based on gesture type
  switch (gestureType) {
    case 'fist':
      // Curl all fingers
      landmarks[HAND_LANDMARKS.WRIST] = { x: 0.5, y: 0.7, z: 0, visibility: 0.95 };
      landmarks[HAND_LANDMARKS.INDEX_TIP] = { x: 0.48, y: 0.55, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_PIP] = { x: 0.47, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_TIP] = { x: 0.5, y: 0.54, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_PIP] = { x: 0.5, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.RING_TIP] = { x: 0.52, y: 0.55, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.RING_PIP] = { x: 0.53, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.PINKY_TIP] = { x: 0.55, y: 0.56, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.PINKY_PIP] = { x: 0.56, y: 0.52, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.THUMB_TIP] = { x: 0.45, y: 0.55, z: 0, visibility: 0.9 };
      break;

    case 'open_palm':
      // Extend all fingers
      landmarks[HAND_LANDMARKS.WRIST] = { x: 0.5, y: 0.75, z: 0, visibility: 0.95 };
      landmarks[HAND_LANDMARKS.INDEX_TIP] = { x: 0.42, y: 0.35, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_PIP] = { x: 0.44, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_MCP] = { x: 0.45, y: 0.6, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_TIP] = { x: 0.5, y: 0.32, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_PIP] = { x: 0.5, y: 0.48, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_MCP] = { x: 0.5, y: 0.6, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.RING_TIP] = { x: 0.56, y: 0.35, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.RING_PIP] = { x: 0.55, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.RING_MCP] = { x: 0.54, y: 0.6, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.PINKY_TIP] = { x: 0.62, y: 0.4, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.PINKY_PIP] = { x: 0.6, y: 0.52, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.PINKY_MCP] = { x: 0.58, y: 0.62, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.THUMB_TIP] = { x: 0.32, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.THUMB_MCP] = { x: 0.4, y: 0.6, z: 0, visibility: 0.9 };
      break;

    case 'thumbs_up':
      // Only thumb extended, pointing up
      landmarks[HAND_LANDMARKS.WRIST] = { x: 0.5, y: 0.7, z: 0, visibility: 0.95 };
      landmarks[HAND_LANDMARKS.THUMB_TIP] = { x: 0.42, y: 0.35, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.THUMB_MCP] = { x: 0.44, y: 0.55, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_TIP] = { x: 0.48, y: 0.58, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_PIP] = { x: 0.47, y: 0.55, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_MCP] = { x: 0.46, y: 0.6, z: 0, visibility: 0.9 };
      break;

    case 'point_right':
      // Only index extended, pointing right
      landmarks[HAND_LANDMARKS.WRIST] = { x: 0.4, y: 0.6, z: 0, visibility: 0.95 };
      landmarks[HAND_LANDMARKS.INDEX_TIP] = { x: 0.7, y: 0.5, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_PIP] = { x: 0.55, y: 0.52, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.INDEX_MCP] = { x: 0.45, y: 0.55, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_TIP] = { x: 0.48, y: 0.58, z: 0, visibility: 0.9 };
      landmarks[HAND_LANDMARKS.MIDDLE_PIP] = { x: 0.47, y: 0.55, z: 0, visibility: 0.9 };
      break;

    default:
      // Random gesture
      break;
  }

  return landmarks;
}

/**
 * Get available gestures info
 */
function getAvailableGestures() {
  return [
    { gesture: GESTURES.FIST, action: 'play', icon: '✊', description: 'Make a fist to play/resume' },
    { gesture: GESTURES.OPEN_PALM, action: 'pause', icon: '✋', description: 'Open palm to pause' },
    { gesture: GESTURES.POINT_RIGHT, action: 'next', icon: '👉', description: 'Point right for next track' },
    { gesture: GESTURES.POINT_LEFT, action: 'previous', icon: '👈', description: 'Point left for previous track' },
    { gesture: GESTURES.THUMBS_UP, action: 'volume_up', icon: '👍', description: 'Thumbs up to increase volume' },
    { gesture: GESTURES.THUMBS_DOWN, action: 'volume_down', icon: '👎', description: 'Thumbs down to decrease volume' },
    { gesture: GESTURES.PEACE, action: 'shuffle', icon: '✌️', description: 'Peace sign to toggle shuffle' },
    { gesture: GESTURES.OK_SIGN, action: 'repeat', icon: '👌', description: 'OK sign to toggle repeat' },
  ];
}

module.exports = {
  GESTURES,
  detectGesture,
  processGestureForMusic,
  resetSession,
  generateMockHandLandmarks,
  getAvailableGestures,
};
