import app from '../server/src/index.js';
import { initDb } from '../server/src/database/db.js';
import { seedDatabase } from '../server/src/database/seed.js';

let initialized = false;
let initPromise = null;

async function ensureDb() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await initDb();
        await seedDatabase(false);
        initialized = true;
      } catch (err) {
        console.error('[Vercel Serverless DB Init Error]:', err);
        throw err;
      }
    })();
  }
  await initPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
    // Ensure req.url starts with /api if stripped by rewrite rule
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Handler Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error during database initialization.'
    });
  }
}
