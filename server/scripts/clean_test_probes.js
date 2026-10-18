import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import { initDb, default as db } from '../src/database/db.js';

export async function cleanTestProbes() {
  console.log('[Cleaner] Initializing SQLite...');
  await initDb();

  const users = db.getAll('users');
  const PROBE_REGEX = /^(concurrent_|blocked_|expire_|student_esc_|student_alice_|student_bob_|hacker_|qa_std|qa_fresh_|xss_|weak\d_|dean_atk|faculty_inv_|replay_|short_)/;
  const probeUsers = users.filter(u => PROBE_REGEX.test(u.email));
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
           OR email LIKE 'student_alice_%'
           OR email LIKE 'student_bob_%'
           OR email LIKE 'hacker_%'
           OR email LIKE 'qa_std%'
           OR email LIKE 'qa_fresh_%'
           OR email LIKE 'xss_%'
           OR email LIKE 'weak%'
           OR email LIKE 'dean_atk%'
           OR email LIKE 'faculty_inv_%'
           OR email LIKE 'replay_%'
           OR email LIKE 'short_%'
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

if (process.argv[1] && process.argv[1].endsWith('clean_test_probes.js')) {
  cleanTestProbes().catch(console.error);
}
