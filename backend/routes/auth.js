const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', [
  body('firstName').optional().notEmpty().withMessage('First name is required'),
  body('lastName').optional().notEmpty().withMessage('Last name is required'),
  body('name').optional().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('nationalId').optional().isLength({ min: 10, max: 10 }).withMessage('National ID must be 10 digits'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', login);

router.get('/me', protect, getMe);

module.exports = router;
