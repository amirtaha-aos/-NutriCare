const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Exercise definitions with expected joint angles and form criteria
const exerciseDefinitions = {
  squat: {
    name: 'Squat',
    keyPoints: ['hip', 'knee', 'ankle'],
    correctForm: {
      kneeAngle: { min: 70, max: 100, phase: 'down' },
      hipAngle: { min: 70, max: 100, phase: 'down' },
      backAngle: { min: 45, max: 90 },
    },
    commonMistakes: [
      'Knees caving inward',
      'Heels lifting off ground',
      'Back rounding',
      'Not going deep enough',
      'Leaning too far forward',
    ],
  },
  pushup: {
    name: 'Push-up',
    keyPoints: ['shoulder', 'elbow', 'wrist', 'hip'],
    correctForm: {
      elbowAngle: { min: 80, max: 100, phase: 'down' },
      bodyAlignment: 'straight line from head to heels',
    },
    commonMistakes: [
      'Hips sagging',
      'Hips too high',
      'Elbows flaring out',
      'Not going low enough',
      'Head dropping',
    ],
  },
  lunge: {
    name: 'Lunge',
    keyPoints: ['hip', 'knee', 'ankle'],
    correctForm: {
      frontKneeAngle: { min: 85, max: 95, phase: 'down' },
      backKneeAngle: { min: 85, max: 95, phase: 'down' },
    },
    commonMistakes: [
      'Front knee going past toes',
      'Back knee not touching ground',
      'Torso leaning forward',
      'Losing balance',
    ],
  },
  plank: {
    name: 'Plank',
    keyPoints: ['shoulder', 'hip', 'ankle'],
    correctForm: {
      bodyAlignment: 'straight line',
      hipPosition: 'neutral',
    },
    commonMistakes: [
      'Hips too high',
      'Hips sagging',
      'Head dropping',
      'Shoulders not over wrists',
    ],
  },
  bicepCurl: {
    name: 'Bicep Curl',
    keyPoints: ['shoulder', 'elbow', 'wrist'],
    correctForm: {
      elbowPosition: 'fixed at side',
      fullROM: { min: 30, max: 150 },
    },
    commonMistakes: [
      'Swinging the weight',
      'Moving elbows forward',
      'Not full range of motion',
      'Using momentum',
    ],
  },
  deadlift: {
    name: 'Deadlift',
    keyPoints: ['hip', 'knee', 'shoulder', 'spine'],
    correctForm: {
      backAngle: 'neutral spine',
      hipHinge: true,
      barPath: 'vertical',
    },
    commonMistakes: [
      'Rounding the back',
      'Bar drifting forward',
      'Not engaging core',
      'Hyperextending at top',
    ],
  },
};

class ExerciseAnalysisService {
  /**
   * Analyze exercise form from image using AI Vision
   */
  async analyzeExerciseForm(imageBase64, exerciseType, repCount = 0) {
    try {
      const exercise = exerciseDefinitions[exerciseType] || exerciseDefinitions.squat;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert fitness coach and movement analyst. Analyze the exercise form in the image and provide detailed feedback.

Exercise being performed: ${exercise.name}

Key points to evaluate:
${exercise.keyPoints.join(', ')}

Common mistakes to look for:
${exercise.commonMistakes.join('\n')}

Provide analysis in JSON format with these fields:
{
  "exerciseDetected": "name of exercise detected",
  "phase": "up/down/hold/transition",
  "formScore": 0-100,
  "isCorrectForm": true/false,
  "bodyAlignment": {
    "isAligned": true/false,
    "issues": []
  },
  "jointAngles": {
    "estimated": { "joint_name": angle_in_degrees }
  },
  "rangeOfMotion": {
    "isFullROM": true/false,
    "currentROM": "percentage or description",
    "targetROM": "description"
  },
  "mistakes": [
    {
      "issue": "description",
      "severity": "minor/moderate/major",
      "correction": "how to fix"
    }
  ],
  "feedback": {
    "positive": ["what's being done well"],
    "improvements": ["what to improve"],
    "cues": ["verbal cues to help"]
  },
  "safetyWarning": "any safety concerns or null"
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${exercise.name} form. Current rep count: ${repCount}. Provide detailed form analysis.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        analysis,
        exerciseType,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Exercise analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze a set of frames to count reps and track form
   */
  async analyzeExerciseSet(frames, exerciseType) {
    try {
      const exercise = exerciseDefinitions[exerciseType] || exerciseDefinitions.squat;

      // Select key frames (every 5th frame or based on motion)
      const keyFrames = frames.filter((_, i) => i % 5 === 0).slice(0, 10);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert fitness coach analyzing a series of frames from an exercise set.

Exercise: ${exercise.name}

Analyze the sequence and provide:
1. Total rep count
2. Correct reps (good form)
3. Incorrect reps (poor form)
4. Overall form consistency
5. Fatigue indicators
6. Detailed feedback

Respond in JSON format:
{
  "totalReps": number,
  "correctReps": number,
  "incorrectReps": number,
  "formConsistency": 0-100,
  "averageFormScore": 0-100,
  "repAnalysis": [
    {
      "repNumber": 1,
      "formScore": 0-100,
      "issues": [],
      "phase": "complete/partial"
    }
  ],
  "fatigueIndicators": {
    "detected": true/false,
    "signs": [],
    "recommendation": ""
  },
  "overallFeedback": {
    "strengths": [],
    "weaknesses": [],
    "focusAreas": [],
    "progressTip": ""
  },
  "safetyNote": ""
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${exercise.name} exercise set. Count the reps and evaluate form quality throughout.`,
              },
              ...keyFrames.map((frame) => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${frame}`,
                  detail: 'low',
                },
              })),
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        exerciseType,
        exerciseName: exercise.name,
        analysis,
        framesAnalyzed: keyFrames.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Exercise set analysis error:', error);
      throw error;
    }
  }

  /**
   * Get real-time rep detection from frame comparison
   */
  async detectRepCompletion(previousFrame, currentFrame, exerciseType, currentPhase) {
    try {
      const exercise = exerciseDefinitions[exerciseType] || exerciseDefinitions.squat;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are analyzing two consecutive frames of a ${exercise.name} exercise.
Current phase: ${currentPhase || 'unknown'}

Determine:
1. Has a rep been completed between these frames?
2. What is the current phase (up/down/hold)?
3. Is the form correct?

Respond in JSON:
{
  "repCompleted": true/false,
  "currentPhase": "up/down/hold",
  "formCorrect": true/false,
  "movementDetected": true/false,
  "formIssue": "brief issue or null"
}`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Previous frame:' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${previousFrame}`, detail: 'low' },
              },
              { type: 'text', text: 'Current frame:' },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${currentFrame}`, detail: 'low' },
              },
            ],
          },
        ],
        max_tokens: 300,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Rep detection error:', error);
      return {
        repCompleted: false,
        currentPhase: currentPhase || 'unknown',
        formCorrect: true,
        movementDetected: false,
        formIssue: null,
      };
    }
  }

  /**
   * Get exercise guidance and form tips
   */
  async getExerciseGuidance(exerciseType) {
    const exercise = exerciseDefinitions[exerciseType];

    if (!exercise) {
      return {
        success: false,
        message: 'Exercise type not found',
        availableExercises: Object.keys(exerciseDefinitions),
      };
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fitness coach. Provide detailed exercise guidance.',
          },
          {
            role: 'user',
            content: `Provide comprehensive guidance for performing a ${exercise.name} with proper form. Include:
1. Step-by-step instructions
2. Breathing pattern
3. Common mistakes to avoid
4. Modifications for beginners
5. Progressions for advanced

Respond in JSON format.`,
          },
        ],
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const guidance = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        exerciseType,
        exerciseName: exercise.name,
        keyPoints: exercise.keyPoints,
        commonMistakes: exercise.commonMistakes,
        guidance,
      };
    } catch (error) {
      console.error('Exercise guidance error:', error);
      throw error;
    }
  }

  /**
   * Generate workout summary with analytics
   */
  async generateWorkoutSummary(workoutData) {
    const { exercises, duration, userId } = workoutData;

    try {
      const totalReps = exercises.reduce((sum, ex) => sum + (ex.totalReps || 0), 0);
      const correctReps = exercises.reduce((sum, ex) => sum + (ex.correctReps || 0), 0);
      const incorrectReps = exercises.reduce((sum, ex) => sum + (ex.incorrectReps || 0), 0);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a fitness coach providing workout summaries and recommendations.',
          },
          {
            role: 'user',
            content: `Generate a workout summary for this session:

Duration: ${duration} minutes
Exercises performed: ${JSON.stringify(exercises, null, 2)}

Total reps: ${totalReps}
Correct form reps: ${correctReps}
Incorrect form reps: ${incorrectReps}
Form accuracy: ${totalReps > 0 ? ((correctReps / totalReps) * 100).toFixed(1) : 0}%

Provide JSON response with:
{
  "summary": "brief summary",
  "performance": {
    "formAccuracy": percentage,
    "consistency": "rating",
    "effort": "rating"
  },
  "achievements": [],
  "areasToImprove": [],
  "nextWorkoutRecommendations": [],
  "motivationalMessage": ""
}`,
          },
        ],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const summary = JSON.parse(response.choices[0].message.content);

      return {
        success: true,
        workoutId: Date.now().toString(),
        userId,
        duration,
        exercises,
        stats: {
          totalReps,
          correctReps,
          incorrectReps,
          formAccuracy: totalReps > 0 ? ((correctReps / totalReps) * 100).toFixed(1) : 0,
        },
        summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Workout summary error:', error);
      throw error;
    }
  }

  /**
   * Get available exercises
   */
  getAvailableExercises() {
    return Object.entries(exerciseDefinitions).map(([key, value]) => ({
      id: key,
      name: value.name,
      keyPoints: value.keyPoints,
      commonMistakes: value.commonMistakes,
    }));
  }
}

module.exports = new ExerciseAnalysisService();
