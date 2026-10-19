import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import { initDb, default as db } from '../src/database/db.js';

async function migrate() {
  console.log('[Migration] Updating SQLite and Neon database schemas for Placement Tracking...');

  await initDb();
  console.log('[Migration] SQLite initialized.');

  // Check Neon Postgres
  if (process.env.DATABASE_URL) {
    console.log('[Migration] Connecting to Neon cloud database...');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS placement_status VARCHAR(30) DEFAULT 'NOT_PLACED';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS placed_company VARCHAR(150);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS placement_package VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS placed_date DATE;
      `);
      console.log('[Migration] Neon PostgreSQL: Added placement_status, placed_company, placement_package, placed_date columns successfully.');
    } catch (err) {
      console.error('[Migration Neon Error]:', err.message);
    } finally {
      await pool.end();
    }
  }

  console.log('[Migration] Migration complete.');
}

migrate().catch(console.error);
