import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function verify() {
  console.log('Testing connection to DATABASE_URL:');
  const maskedUrl = (process.env.DATABASE_URL || '').replace(/:[^:@]+@/, ':****@');
  console.log('  URL:', maskedUrl);

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pool.connect();
    console.log('\n[1/4] PostgreSQL Server Handshake:');
    console.log('  ✓ Connected to PostgreSQL instance successfully!');

    // Check version and current database
    const info = await client.query('SELECT current_database(), current_user, version()');
    console.log('  - Active Database:', info.rows[0].current_database);
    console.log('  - Connected User:', info.rows[0].current_user);
    console.log('  - Engine:', info.rows[0].version.split(',')[0]);

    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n[2/4] Schema Tables Verification:');
    console.log(`  ✓ Found ${tables.rows.length} public tables:`);
    console.log('   ', tables.rows.map(r => r.table_name).join(', '));

    // Count records
    const qCount = await client.query('SELECT COUNT(*) FROM questions');
    const optCount = await client.query('SELECT COUNT(*) FROM question_options');
    const pCount = await client.query('SELECT COUNT(*) FROM coding_problems');
    const tcCount = await client.query('SELECT COUNT(*) FROM coding_test_cases');
    const uCount = await client.query('SELECT COUNT(*) FROM users');
    const docCount = await client.query('SELECT COUNT(*) FROM knowledge_documents');

    console.log('\n[3/4] Live Record Counts:');
    console.log('  - Questions (MCQs):', qCount.rows[0].count);
    console.log('  - Question Options:', optCount.rows[0].count);
    console.log('  - Coding Problems:', pCount.rows[0].count);
    console.log('  - Coding Test Cases:', tcCount.rows[0].count);
    console.log('  - Users (Students & Faculty):', uCount.rows[0].count);
    console.log('  - Knowledge Documents (RAG):', docCount.rows[0].count);

    // Test full-text RAG search
    const ragTest = await client.query(`
      SELECT id, title 
      FROM knowledge_documents 
      WHERE search_vector @@ plainto_tsquery('english', 'normalization')
      LIMIT 1;
    `);
    console.log('\n[4/4] PostgreSQL RAG Full-Text Vector Search:');
    console.log('  - Query: "normalization"');
    console.log('  - Matched Document:', ragTest.rows[0]?.title);

    client.release();
    await pool.end();

    console.log('\n======================================================');
    console.log('✅ DATABASE STATUS: 100% ONLINE, CONNECTED & VERIFIED');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

verify();
