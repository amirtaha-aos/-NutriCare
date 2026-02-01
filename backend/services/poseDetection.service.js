/**
 * Pose Detection Service using MediaPipe/TensorFlow
 * Handles real-time exercise form analysis and rep counting
 */

class PoseDetectionService {
  constructor() {
    // Landmark indices for body parts (MediaPipe Pose landmarks)
    this.LANDMARKS = {
      NOSE: 0,
      LEFT_EYE_INNER: 1,
      LEFT_EYE: 2,
      LEFT_EYE_OUTER: 3,
      RIGHT_EYE_INNER: 4,
      RIGHT_EYE: 5,
      RIGHT_EYE_OUTER: 6,
      LEFT_EAR: 7,
      RIGHT_EAR: 8,
      MOUTH_LEFT: 9,
      MOUTH_RIGHT: 10,
      LEFT_SHOULDER: 11,
      RIGHT_SHOULDER: 12,
      LEFT_ELBOW: 13,
      RIGHT_ELBOW: 14,
      LEFT_WRIST: 15,
      RIGHT_WRIST: 16,
      LEFT_PINKY: 17,
      RIGHT_PINKY: 18,
      LEFT_INDEX: 19,
      RIGHT_INDEX: 20,
      LEFT_THUMB: 21,
      RIGHT_THUMB: 22,
      LEFT_HIP: 23,
      RIGHT_HIP: 24,
      LEFT_KNEE: 25,
      RIGHT_KNEE: 26,
      LEFT_ANKLE: 27,
      RIGHT_ANKLE: 28,
      LEFT_HEEL: 29,
      RIGHT_HEEL: 30,
      LEFT_FOOT_INDEX: 31,
      RIGHT_FOOT_INDEX: 32,
    };

    // Exercise configurations with correct form angles
    this.EXERCISE_CONFIG = {
      squat: {
        name: 'Squat',
        keyLandmarks: ['hip', 'knee', 'ankle', 'shoulder'],
        phases: {
          up: { kneeAngle: { min: 160, max: 180 } },
          down: { kneeAngle: { min: 70, max: 110 } },
        },
        correctForm: {
          kneeOverToe: true,
          backStraight: true,
          minDepth: 90,
        },
      },
      pushup: {
        name: 'Push-up',
        keyLandmarks: ['shoulder', 'elbow', 'wrist', 'hip'],
        phases: {
          up: { elbowAngle: { min: 160, max: 180 } },
          down: { elbowAngle: { min: 70, max: 100 } },
        },
        correctForm: {
          bodyAlignment: true,
          elbowTuck: true,
        },
      },
      lunge: {
        name: 'Lunge',
        keyLandmarks: ['hip', 'knee', 'ankle'],
        phases: {
          up: { frontKneeAngle: { min: 160, max: 180 } },
          down: { frontKneeAngle: { min: 80, max: 100 } },
        },
        correctForm: {
          kneeAlignment: true,
          torsoUpright: true,
        },
      },
      bicepCurl: {
        name: 'Bicep Curl',
        keyLandmarks: ['shoulder', 'elbow', 'wrist'],
        phases: {
          up: { elbowAngle: { min: 30, max: 60 } },
          down: { elbowAngle: { min: 150, max: 180 } },
        },
        correctForm: {
          elbowStable: true,
          noSwinging: true,
        },
      },
      plank: {
        name: 'Plank',
        keyLandmarks: ['shoulder', 'hip', 'ankle'],
        isStatic: true,
        correctForm: {
          bodyLine: { min: 165, max: 180 },
          shoulderOverWrist: true,
        },
      },
      deadlift: {
        name: 'Deadlift',
        keyLandmarks: ['shoulder', 'hip', 'knee', 'ankle'],
        phases: {
          up: { hipAngle: { min: 160, max: 180 } },
          down: { hipAngle: { min: 80, max: 110 } },
        },
        correctForm: {
          backFlat: true,
          barPath: true,
        },
      },
    };

    // Session state
    this.sessionState = {
      currentPhase: 'ready',
      repCount: 0,
      lastPhase: null,
      phaseHistory: [],
      formScores: [],
    };
  }

  /**
   * Calculate angle between three points
   */
  calculateAngle(point1, point2, point3) {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                    Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2)
    );
  }

  /**
   * Get key angles for an exercise from landmarks
   */
  getExerciseAngles(landmarks, exerciseType) {
    const L = this.LANDMARKS;
    const angles = {};

    switch (exerciseType) {
      case 'squat':
        // Left knee angle
        angles.leftKnee = this.calculateAngle(
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_KNEE],
          landmarks[L.LEFT_ANKLE]
        );
        // Right knee angle
        angles.rightKnee = this.calculateAngle(
          landmarks[L.RIGHT_HIP],
          landmarks[L.RIGHT_KNEE],
          landmarks[L.RIGHT_ANKLE]
        );
        // Hip angle (for back straightness)
        angles.leftHip = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_KNEE]
        );
        angles.kneeAngle = (angles.leftKnee + angles.rightKnee) / 2;
        break;

      case 'pushup':
        // Elbow angles
        angles.leftElbow = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_ELBOW],
          landmarks[L.LEFT_WRIST]
        );
        angles.rightElbow = this.calculateAngle(
          landmarks[L.RIGHT_SHOULDER],
          landmarks[L.RIGHT_ELBOW],
          landmarks[L.RIGHT_WRIST]
        );
        // Body alignment (shoulder-hip-ankle)
        angles.bodyLine = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_ANKLE]
        );
        angles.elbowAngle = (angles.leftElbow + angles.rightElbow) / 2;
        break;

      case 'bicepCurl':
        angles.leftElbow = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_ELBOW],
          landmarks[L.LEFT_WRIST]
        );
        angles.rightElbow = this.calculateAngle(
          landmarks[L.RIGHT_SHOULDER],
          landmarks[L.RIGHT_ELBOW],
          landmarks[L.RIGHT_WRIST]
        );
        angles.elbowAngle = (angles.leftElbow + angles.rightElbow) / 2;
        break;

      case 'lunge':
        angles.frontKnee = this.calculateAngle(
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_KNEE],
          landmarks[L.LEFT_ANKLE]
        );
        angles.backKnee = this.calculateAngle(
          landmarks[L.RIGHT_HIP],
          landmarks[L.RIGHT_KNEE],
          landmarks[L.RIGHT_ANKLE]
        );
        angles.frontKneeAngle = angles.frontKnee;
        break;

      case 'plank':
        angles.bodyLine = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_ANKLE]
        );
        angles.shoulderAngle = this.calculateAngle(
          landmarks[L.LEFT_ELBOW],
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_HIP]
        );
        break;

      case 'deadlift':
        angles.hipAngle = this.calculateAngle(
          landmarks[L.LEFT_SHOULDER],
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_KNEE]
        );
        angles.kneeAngle = this.calculateAngle(
          landmarks[L.LEFT_HIP],
          landmarks[L.LEFT_KNEE],
          landmarks[L.LEFT_ANKLE]
        );
        break;
    }

    return angles;
  }

  /**
   * Detect current phase of exercise based on angles
   */
  detectPhase(angles, exerciseType) {
    const config = this.EXERCISE_CONFIG[exerciseType];
    if (!config || config.isStatic) return 'hold';

    const phases = config.phases;
    const primaryAngle = Object.keys(phases.up)[0];
    const angleValue = angles[primaryAngle];

    if (!angleValue) return 'unknown';

    if (angleValue >= phases.up[primaryAngle].min &&
        angleValue <= phases.up[primaryAngle].max) {
      return 'up';
    }

    if (angleValue >= phases.down[primaryAngle].min &&
        angleValue <= phases.down[primaryAngle].max) {
      return 'down';
    }

    return 'transition';
  }

  /**
   * Check if form is correct
   */
  checkForm(landmarks, angles, exerciseType) {
    const config = this.EXERCISE_CONFIG[exerciseType];
    if (!config) return { isCorrect: true, issues: [] };

    const issues = [];
    let score = 100;

    switch (exerciseType) {
      case 'squat':
        // Check knee over toe
        const knee = landmarks[this.LANDMARKS.LEFT_KNEE];
        const toe = landmarks[this.LANDMARKS.LEFT_FOOT_INDEX];
        if (knee.x > toe.x + 0.05) {
          issues.push('Knees going too far forward');
          score -= 15;
        }
        // Check depth
        if (angles.kneeAngle > 110 && this.sessionState.currentPhase === 'down') {
          issues.push('Go deeper for full range of motion');
          score -= 10;
        }
        // Check back angle
        if (angles.leftHip < 45) {
          issues.push('Keep your back more upright');
          score -= 15;
        }
        break;

      case 'pushup':
        // Check body alignment
        if (angles.bodyLine < 160) {
          issues.push('Keep your body in a straight line');
          score -= 20;
        }
        // Check elbow tuck
        // Elbow should not flare out too much
        break;

      case 'bicepCurl':
        // Check elbow stability
        const shoulder = landmarks[this.LANDMARKS.LEFT_SHOULDER];
        const elbow = landmarks[this.LANDMARKS.LEFT_ELBOW];
        if (Math.abs(shoulder.x - elbow.x) > 0.1) {
          issues.push('Keep elbows close to your body');
          score -= 15;
        }
        break;

      case 'plank':
        if (angles.bodyLine < 165 || angles.bodyLine > 180) {
          issues.push('Keep your body straight');
          score -= 20;
        }
        break;
    }

    return {
      isCorrect: issues.length === 0,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Detect if a rep was completed
   */
  detectRep(currentPhase, exerciseType) {
    const config = this.EXERCISE_CONFIG[exerciseType];
    if (!config || config.isStatic) return false;

    // A rep is completed when going from down to up
    if (this.sessionState.lastPhase === 'down' && currentPhase === 'up') {
      return true;
    }

    return false;
  }

  /**
   * Detect thumbs up/down gesture
   */
  detectGesture(landmarks) {
    const L = this.LANDMARKS;

    // Get hand landmarks
    const wrist = landmarks[L.LEFT_WRIST] || landmarks[L.RIGHT_WRIST];
    const thumb = landmarks[L.LEFT_THUMB] || landmarks[L.RIGHT_THUMB];
    const index = landmarks[L.LEFT_INDEX] || landmarks[L.RIGHT_INDEX];
    const pinky = landmarks[L.LEFT_PINKY] || landmarks[L.RIGHT_PINKY];

    if (!wrist || !thumb || !index || !pinky) return null;

    // Calculate if thumb is significantly above or below wrist
    const thumbWristDiff = wrist.y - thumb.y; // Positive = thumb up
    const fingersClosed = Math.abs(index.y - pinky.y) < 0.05;

    if (thumbWristDiff > 0.08 && fingersClosed) {
      return 'thumbs_up';
    }

    if (thumbWristDiff < -0.08 && fingersClosed) {
      return 'thumbs_down';
    }

    return null;
  }

  /**
   * Check if person is in correct position for exercise
   */
  checkPositioning(landmarks, exerciseType) {
    const L = this.LANDMARKS;

    // Check if key landmarks are visible
    const requiredLandmarks = [
      L.LEFT_SHOULDER, L.RIGHT_SHOULDER,
      L.LEFT_HIP, L.RIGHT_HIP,
      L.LEFT_KNEE, L.RIGHT_KNEE,
    ];

    let visibleCount = 0;
    let totalConfidence = 0;

    for (const idx of requiredLandmarks) {
      if (landmarks[idx] && landmarks[idx].visibility > 0.5) {
        visibleCount++;
        totalConfidence += landmarks[idx].visibility;
      }
    }

    const visibility = visibleCount / requiredLandmarks.length;
    const avgConfidence = visibleCount > 0 ? totalConfidence / visibleCount : 0;

    // Check if person is in frame properly
    const shoulder = landmarks[L.LEFT_SHOULDER];
    const hip = landmarks[L.LEFT_HIP];
    const ankle = landmarks[L.LEFT_ANKLE];

    let inFrame = true;
    let positioningTips = [];

    if (!shoulder || shoulder.x < 0.1 || shoulder.x > 0.9) {
      inFrame = false;
      positioningTips.push('Move to center of frame');
    }

    if (!ankle || ankle.visibility < 0.5) {
      positioningTips.push('Make sure your full body is visible');
    }

    // Check distance from camera
    if (shoulder && hip) {
      const bodyHeight = Math.abs(shoulder.y - hip.y);
      if (bodyHeight < 0.2) {
        positioningTips.push('Move closer to the camera');
      } else if (bodyHeight > 0.6) {
        positioningTips.push('Move back from the camera');
      }
    }

    return {
      isReady: visibility >= 0.8 && inFrame && avgConfidence > 0.6,
      visibility,
      confidence: avgConfidence,
      tips: positioningTips,
    };
  }

  /**
   * Process a single frame and return analysis
   */
  analyzeFrame(landmarks, exerciseType) {
    if (!landmarks || landmarks.length < 33) {
      return {
        success: false,
        error: 'Insufficient landmarks detected',
      };
    }

    // Check positioning first
    const positioning = this.checkPositioning(landmarks, exerciseType);

    // Get exercise angles
    const angles = this.getExerciseAngles(landmarks, exerciseType);

    // Detect current phase
    const currentPhase = this.detectPhase(angles, exerciseType);

    // Check form
    const formCheck = this.checkForm(landmarks, angles, exerciseType);

    // Check for rep completion
    const repCompleted = this.detectRep(currentPhase, exerciseType);

    // Detect gesture
    const gesture = this.detectGesture(landmarks);

    // Update session state
    if (repCompleted) {
      this.sessionState.repCount++;
      this.sessionState.formScores.push(formCheck.score);
    }
    this.sessionState.lastPhase = this.sessionState.currentPhase;
    this.sessionState.currentPhase = currentPhase;
    this.sessionState.phaseHistory.push(currentPhase);

    return {
      success: true,
      positioning,
      angles,
      phase: currentPhase,
      form: formCheck,
      repCompleted,
      repCount: this.sessionState.repCount,
      gesture,
      averageFormScore: this.sessionState.formScores.length > 0
        ? this.sessionState.formScores.reduce((a, b) => a + b, 0) / this.sessionState.formScores.length
        : 100,
    };
  }

  /**
   * Reset session state
   */
  resetSession() {
    this.sessionState = {
      currentPhase: 'ready',
      repCount: 0,
      lastPhase: null,
      phaseHistory: [],
      formScores: [],
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const { repCount, formScores } = this.sessionState;

    return {
      totalReps: repCount,
      averageFormScore: formScores.length > 0
        ? Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length)
        : 100,
      perfectReps: formScores.filter(s => s >= 90).length,
      goodReps: formScores.filter(s => s >= 70 && s < 90).length,
      needsWork: formScores.filter(s => s < 70).length,
    };
  }
}

module.exports = new PoseDetectionService();
