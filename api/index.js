import app from '../server/src/index.js';
import { initDb } from '../server/src/database/db.js';
import { seedDatabase } from '../server/src/database/seed.js';

let initialized = false;

async function ensureDb() {
  if (initialized) return;
  try {
    await initDb();
    try {
      await seedDatabase(false);
    } catch {}
    initialized = true;
  } catch (err) {
    console.warn('[Vercel Serverless DB Init Warning]:', err?.message);
    initialized = true;
  }
}

export default async function handler(req, res) {
  try {
    await ensureDb();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Execution Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error.',
      error: err?.message || 'Internal error'
    });
  }
}
