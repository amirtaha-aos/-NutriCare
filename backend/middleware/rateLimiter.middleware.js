const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Middleware
 * Prevents abuse of expensive AI endpoints
 */

/**
 * Food scanning rate limiter
 * Limit: 30 scans per day per user
 */
const foodScanLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30, // 30 requests per day
  message: {
    success: false,
    message: 'Too many food scans. Daily limit: 30 scans. Please try again tomorrow.',
    limit: 30,
    window: '24 hours',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for testing
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Chat message rate limiter
 * Limit: 20 messages per hour per user
 */
const chatMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 messages per hour
  message: {
    success: false,
    message: 'Too many chat messages. Hourly limit: 20 messages. Please wait before sending more.',
    limit: 20,
    window: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Meal plan generation rate limiter
 * Limit: 2 meal plans per week per user
 */
const mealPlanLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  max: 2, // 2 meal plans per week
  message: {
    success: false,
    message: 'Weekly meal plan limit reached. You can generate 2 meal plans per week.',
    limit: 2,
    window: '7 days',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Workout plan generation rate limiter
 * Limit: 5 workout plans per week per user
 */
const workoutPlanLimiter = rateLimit({
  windowMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  max: 5, // 5 workout plans per week
  message: {
    success: false,
    message: 'Weekly workout plan limit reached. You can generate 5 workout plans per week.',
    limit: 5,
    window: '7 days',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * General API rate limiter
 * Limit: 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
    limit: 100,
    window: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

/**
 * Authentication rate limiter
 * Limit: 5 login/register attempts per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    limit: 5,
    window: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true';
  },
});

module.exports = {
  foodScanLimiter,
  chatMessageLimiter,
  mealPlanLimiter,
  workoutPlanLimiter,
  generalLimiter,
  authLimiter,
};
