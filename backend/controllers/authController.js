const User = require('../models/User');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, nationalId, password, name, role } = req.body;

    // Check if user exists by email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Check if user exists by nationalId
    if (nationalId) {
      const existingNationalId = await User.findOne({ nationalId });
      if (existingNationalId) {
        return res.status(400).json({
          success: false,
          message: 'This National ID is already registered'
        });
      }
    }

    // Create user - support both old (name) and new (firstName, lastName) format
    const userData = {
      email,
      password: password || nationalId, // Use nationalId as password if not provided
      role: role || 'patient'
    };

    // Handle new registration format
    if (firstName && lastName) {
      userData.firstName = firstName;
      userData.lastName = lastName;
      userData.nationalId = nationalId;
    } else if (name) {
      // Handle old format for backward compatibility
      const nameParts = name.split(' ');
      userData.firstName = nameParts[0] || name;
      userData.lastName = nameParts.slice(1).join(' ') || 'User';
      userData.nationalId = nationalId || '0000000000';
    }

    const user = await User.create(userData);

    // If patient, create patient profile
    if (user.role === 'patient') {
      await Patient.create({ user: user._id });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: err.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let patient = null;

    if (user.role === 'patient') {
      patient = await Patient.findOne({ user: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        patient
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user information'
    });
  }
};

// Send token in response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      healthData: user.healthData
    }
  });
};
