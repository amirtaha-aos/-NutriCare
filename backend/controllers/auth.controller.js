const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/environment');

// In-memory refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, env.jwt.secret, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, env.jwt.refreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, age, gender } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
      });

      await user.save();

      // Generate tokens
      const tokens = generateTokens(user._id.toString());
      refreshTokens.add(tokens.refreshToken);

      // Return user data without password
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const tokens = generateTokens(user._id.toString());
      refreshTokens.add(tokens.refreshToken);

      // Return user data without password
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          tokens
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    jwt.verify(refreshToken, env.jwt.refreshSecret, (err, decoded) => {
      if (err) {
        refreshTokens.delete(refreshToken);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Generate new tokens
      const tokens = generateTokens(decoded.userId);

      // Remove old refresh token and add new one
      refreshTokens.delete(refreshToken);
      refreshTokens.add(tokens.refreshToken);

      res.json({
        success: true,
        data: tokens
      });
    });
  }

  async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  logout(req, res) {
    const { refreshToken } = req.body;
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

module.exports = new AuthController();
