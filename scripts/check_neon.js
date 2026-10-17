import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
  const tables = tableRes.rows.map(r => r.table_name);
  console.log('--- CONNECTED NEON POSTGRESQL CLUSTER ---');
  console.log('Host: ep-dark-mountain-b4w8hfn7-pooler.c-6.us-east-2.aws.neon.tech');
  console.log('Database: neondb');
  console.log('Total Tables in Neon:', tables.length);
  
  const userCount = await pool.query('SELECT COUNT(*) FROM users');
  const questionCount = await pool.query('SELECT COUNT(*) FROM questions');
  const logCount = await pool.query('SELECT COUNT(*) FROM access_logs');
  
  console.log('Total Users in Neon:', userCount.rows[0].count);
  console.log('Total Questions in Neon:', questionCount.rows[0].count);
  console.log('Total Access Logs in Neon:', logCount.rows[0].count);
  
  await pool.end();
}

main().catch(err => {
  console.error(err);
  pool.end();
});
