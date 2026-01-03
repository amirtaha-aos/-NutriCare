import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/database';

// Routes
import authRoutes from './routes/auth';
import mealRoutes from './routes/meals';
import healthRoutes from './routes/health';
import aiRoutes from './routes/ai';

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/meals', mealRoutes);
app.use('/api/v2/health', healthRoutes);
app.use('/api/v2/ai', aiRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'NutriCare Backend v2 is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║   🥗 NutriCare Backend v2 - Running     ║
║                                          ║
║   Port: ${PORT}                            ║
║   Env: ${process.env.NODE_ENV || 'development'}                   ║
║   Time: ${new Date().toLocaleTimeString()}                 ║
║                                          ║
╚══════════════════════════════════════════╝
  `);
});

export default app;
