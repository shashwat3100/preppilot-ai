import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const tables = ['quiz_sessions', 'attempts', 'student_performance', 'coding_submissions'];
  const res = await pool.query(`
    SELECT t.relname as table_name, c.conname, pg_get_constraintdef(c.oid) AS constraint_def
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = ANY($1) AND c.contype = 'c';
  `, [tables]);
  console.table(res.rows);
  await pool.end();
}

check().catch(console.error);
