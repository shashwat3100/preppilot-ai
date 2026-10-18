import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import { initDb, default as db } from '../src/database/db.js';

async function clean() {
  console.log('[Cleaner] Initializing SQLite...');
  await initDb();

  const users = db.getAll('users');
  const probeUsers = users.filter(u => /^(concurrent_|blocked_|expire_|student_esc_)/.test(u.email));
  console.log(`[Cleaner] Found ${probeUsers.length} test probe users in local SQLite.`);

  for (const u of probeUsers) {
    db.delete('users', u.id);
  }
  console.log('[Cleaner] Removed probe users from local SQLite.');

  // Clean from Neon
  if (process.env.DATABASE_URL) {
    console.log('[Cleaner] Connecting to Neon cloud database...');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      const res = await pool.query(`
        DELETE FROM users 
        WHERE email LIKE 'concurrent_%' 
           OR email LIKE 'blocked_%' 
           OR email LIKE 'expire_%' 
           OR email LIKE 'student_esc_%'
        RETURNING id, email;
      `);
      console.log(`[Cleaner] Deleted ${res.rowCount} test probe accounts from Neon PostgreSQL.`);
    } catch (err) {
      console.error('[Cleaner Neon Error]:', err.message);
    } finally {
      await pool.end();
    }
  }

  console.log('[Cleaner] Finished cleanup.');
}

clean().catch(console.error);
