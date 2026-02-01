require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const chatRoutes = require('./routes/chat.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const workoutPlanRoutes = require('./routes/workoutPlan.routes');
const samsungHealthRoutes = require('./routes/samsungHealth.routes');
const mealPlanRoutes = require('./routes/mealPlan.routes');
const exerciseAnalysisRoutes = require('./routes/exerciseAnalysis.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const moodRoutes = require('./routes/mood.routes');
const recommendationRoutes = require('./routes/recommendation');
const mealsRoutes = require('./routes/meals.routes');
const foodsRoutes = require('./routes/foods.routes');
const usersRoutes = require('./routes/users.routes');
const gestureMusicRoutes = require('./routes/gestureMusic.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/workout-plan', workoutPlanRoutes);
app.use('/api/samsung-health', samsungHealthRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/exercise-analysis', exerciseAnalysisRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/gesture-music', gestureMusicRoutes);

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({
    success: true,
    message: 'NutriCare API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║   🥗 NutriCare Backend API Server                    ║
║   Port: ${PORT}                                          ║
║   Host: 0.0.0.0 (all interfaces)                     ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Status: Running ✓                                  ║
╚══════════════════════════════════════════════════════╝

📍 Available Endpoints:

Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  GET    /api/auth/me
  POST   /api/auth/logout

Health Profile:
  GET    /api/health/profile
  PUT    /api/health/profile
  POST   /api/health/disease
  PUT    /api/health/disease/:id
  DELETE /api/health/disease/:id
  POST   /api/health/medication
  PUT    /api/health/medication/:id
  DELETE /api/health/medication/:id
  POST   /api/health/allergy
  DELETE /api/health/allergy/:id
  GET    /api/health/metrics
  POST   /api/health/metrics/calculate

Nutrition (AI-Powered):
  POST   /api/nutrition/analyze-food
  POST   /api/nutrition/analyze-partial
  POST   /api/nutrition/scan-barcode
  POST   /api/nutrition/log-meal
  GET    /api/nutrition/meals
  PUT    /api/nutrition/meals/:mealId
  DELETE /api/nutrition/meals/:mealId
  GET    /api/nutrition/foods/search
  GET    /api/nutrition/stats

Chat (AI Assistant):
  POST   /api/chat/message
  POST   /api/chat/session
  GET    /api/chat/sessions
  GET    /api/chat/session/:sessionId
  PUT    /api/chat/session/:sessionId
  DELETE /api/chat/session/:sessionId
  GET    /api/chat/stats

Exercise & Workout:
  POST   /api/exercise/log
  GET    /api/exercise/history
  GET    /api/exercise/stats
  POST   /api/workout-plan/generate
  GET    /api/workout-plan
  POST   /api/workout-plan/:id/activate

Meal Planning (AI-Powered):
  POST   /api/meal-plan/generate
  GET    /api/meal-plan
  GET    /api/meal-plan/:id
  POST   /api/meal-plan/:id/activate
  GET    /api/meal-plan/:id/shopping-list
  GET    /api/meal-plan/:id/export-pdf
  DELETE /api/meal-plan/:id

Samsung Health:
  POST   /api/samsung-health/sync
  GET    /api/samsung-health/stats

System:
  GET    /api/health-check

🌐 Access URLs:
  Local:             http://localhost:${PORT}
  Network:           http://0.0.0.0:${PORT}
  Android Emulator:  http://10.0.2.2:${PORT}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
