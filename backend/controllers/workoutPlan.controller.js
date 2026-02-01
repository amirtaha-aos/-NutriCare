const WorkoutPlan = require('../models/WorkoutPlan');
const User = require('../models/User');
const { openaiClient, MODELS } = require('../config/openai');

exports.generateWorkoutPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const prompt = `Create a personalized workout plan. Return as JSON with title, difficulty, and dailyWorkouts array`;

    const completion = await openaiClient.chat.completions.create({
      model: MODELS.CHAT,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const planData = JSON.parse(completion.choices[0].message.content);

    const workoutPlan = await WorkoutPlan.create({
      userId,
      title: planData.title || '4-Week Fitness Plan',
      difficulty: planData.difficulty || 'intermediate',
      duration: 4,
      dailyWorkouts: planData.dailyWorkouts || [],
      source: 'ai_generated',
    });

    res.status(201).json({ success: true, data: workoutPlan });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate workout plan' });
  }
};

exports.getWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get workout plans' });
  }
};

exports.getActivePlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ userId: req.userId, isActive: true });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get active plan' });
  }
};

exports.setActivePlan = async (req, res) => {
  try {
    await WorkoutPlan.updateMany({ userId: req.userId }, { isActive: false });
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.planId, { isActive: true }, { new: true });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set active plan' });
  }
};

module.exports = exports;
