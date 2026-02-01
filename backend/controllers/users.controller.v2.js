const User = require('../models/User');
const calculationService = require('../services/calculation.service');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform _id to id
    const userResponse = user.toObject();
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, weight, height, age, gender, activityLevel, goals } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (goals !== undefined) {
      user.goals = { ...user.goals, ...goals };
    }

    // Calculate recommended calories if we have all required data
    if (user.weight && user.height && user.age && user.gender) {
      try {
        const metrics = calculationService.calculateAllMetrics({
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          activityLevel: user.activityLevel || 'moderate'
        });

        // Set recommended calories based on goal type
        const goalCalories = calculationService.calculateCaloriesForGoal({
          tdee: metrics.tdee,
          goalType: user.goals?.goalType || 'maintain',
          currentWeight: user.weight,
          targetWeight: user.goals?.targetWeight
        });

        // Only set if not already manually set
        if (!user.goals?.dailyCalories) {
          user.goals = {
            ...user.goals,
            dailyCalories: goalCalories
          };
        }
      } catch (calcError) {
        console.log('Metrics calculation skipped:', calcError.message);
      }
    }

    await user.save();

    // Remove password from response and transform _id to id
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Update user goals
exports.updateGoals = async (req, res) => {
  try {
    const goals = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.goals = { ...user.goals, ...goals };
    await user.save();

    // Remove password from response and transform _id to id
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goals'
    });
  }
};
