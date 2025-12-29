const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/lab-tests', require('./routes/labTests'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/health-log', require('./routes/health'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/ai', require('./routes/ai')); // New AI routes (no auth required)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NutriCare API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
