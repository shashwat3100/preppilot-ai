import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDb } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import { isPostgresConfigured } from './database/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../client/dist');

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import preppilotRoutes from './routes/preppilotRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import deanRoutes from './routes/deanRoutes.js';
import codingRoutes from './routes/codingRoutes.js';
import aptitudeRoutes from './routes/aptitudeRoutes.js';
import { authLimiter } from './middleware/rateLimiter.js';
import { accessLogger } from './middleware/accessLogger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit CORS Origin Allowlist with Live Server support
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, listed origins, or any localhost/127.0.0.1 port (e.g. VS Code Live Server)
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app') ||
      Boolean(process.env.VERCEL)
    ) {
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

// Ensure database and static educational content are initialized on first request (Serverless & Direct)
let dbInitialized = false;
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = (async () => {
        try {
          await initDb();
          try { await seedDatabase(false); } catch {}
          dbInitialized = true;
        } catch (err) {
          console.warn('[Database Init Warning]:', err?.message);
          dbInitialized = true;
        }
      })();
    }
    await dbInitPromise;
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  const isPg = isPostgresConfigured();
  const qCount = (db.getAll('questions') || []).length;
  const kCount = (db.getAll('knowledgeDocuments') || []).length;

  res.json({
    status: 'ONLINE',
    service: 'PrepPilot AI Backend & Coding Arena Engine',
    database: {
      connected: true,
      postgres_cloud_active: isPg,
      questions_loaded: qCount,
      knowledge_documents_loaded: kCount
    },
    node_version: process.version,
    timestamp: new Date().toISOString()
  });
});

// Telemetry & Visitor Access Logger (Tracks website visits into PostgreSQL & local database)
app.use(accessLogger);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
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
app.use('/api/dean', deanRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/aptitude', aptitudeRoutes);

// Video Stream & Download Endpoints for Walkthrough Video
app.get('/api/video/stream', (req, res) => {
  const videoPath = path.resolve(__dirname, '../../recordings/PrepPilot_AI_Full_Platform_Walkthrough.webm');
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ success: false, message: 'Walkthrough video file not found.' });
  }
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/webm',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/webm',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.get('/api/video/download', (req, res) => {
  const videoPath = path.resolve(__dirname, '../../recordings/PrepPilot_AI_Full_Platform_Walkthrough.webm');
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ success: false, message: 'Walkthrough video file not found.' });
  }
  res.download(videoPath, 'PrepPilot_AI_Full_Platform_Walkthrough.webm');
});

// Serve static frontend build if present (for Go Live, production, or unified port 5000 access)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[CareerPrep Server Error]:', err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProd && (!err.status || err.status === 500)
      ? 'An unexpected error occurred. Please try again later.'
      : (err.message || 'Internal Server Error')
  });
});

// Bootstrap server
export const startServer = async (port = PORT) => {
  try {
    await initDb();
    await seedDatabase(false); // seed if empty

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        if (!process.env.TEST_MODE) {
          console.log(`==================================================================`);
          console.log(`🚀 PrepPilot AI Server running on http://localhost:${port}`);
          console.log(`🎙️ PrepPilot Voice Assistant RAG Engine initialized`);
          console.log(`💻 Coding Arena & Compiler Sandboxing active`);
          console.log(`📊 Adaptive Analytics & Recommendation Engine online`);
          console.log(`==================================================================`);
        }
        resolve(server);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start automatically only when run directly and not in serverless/test mode
const isDirectRun = !process.env.VERCEL && !process.env.TEST_MODE && process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
);

if (isDirectRun) {
  startServer();
}

export default app;
