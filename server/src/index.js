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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CareerPrep AI Engine',
    assistant: 'PrepPilot Voice AI',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
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
      console.log(`🚀 CareerPrep AI Server running on http://localhost:${PORT}`);
      console.log(`🎙️ PrepPilot Voice Assistant RAG Engine initialized`);
      console.log(`📊 Recommendation Engine & Adaptive Quiz System active`);
      console.log(`==================================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// restart timestamp: 
639274147737499863
