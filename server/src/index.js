import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database/db.js';
import { seedDatabase } from './database/seed.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import preppilotRoutes from './routes/preppilotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import { authLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit CORS Origin Allowlist
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: Access denied for origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser with strict payload limits (prevents payload-based memory exhaustion)
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PrepPilot AI Backend & Coding Arena Engine',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes with specialized rate limits
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/preppilot', preppilotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coding', codingRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[CareerPrep Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Bootstrap server
const startServer = async () => {
  try {
    await initDb();
    await seedDatabase(false); // seed if empty

    app.listen(PORT, () => {
      console.log(`==================================================================`);
      console.log(`🚀 PrepPilot AI Server running on http://localhost:${PORT}`);
      console.log(`🎙️ PrepPilot Voice Assistant RAG Engine initialized`);
      console.log(`💻 Coding Arena & Compiler Sandboxing active`);
      console.log(`📊 Adaptive Analytics & Recommendation Engine online`);
      console.log(`==================================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
