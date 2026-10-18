import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZrdW6cUlhE1F@ep-dark-mountain-b4w8hfn7-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function main() {
  console.log('[Neon DB Inspector] Connecting to Neon cloud database...');
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. All Tables and Row Counts
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n======================================================');
    console.log('📊 ALL TABLES & RECORD COUNTS IN NEON POSTGRESQL');
    console.log('======================================================');
    const counts = [];
    for (const row of tablesRes.rows) {
      const t = row.table_name;
      try {
        const countRes = await pool.query(`SELECT count(*) FROM "${t}"`);
        counts.push({ Table: t, "Record Count": parseInt(countRes.rows[0].count, 10) });
      } catch (e) {
        counts.push({ Table: t, "Record Count": 'Error: ' + e.message });
      }
    }
    console.table(counts);

    // 2. User Accounts Breakdown
    console.log('\n======================================================');
    console.log('👥 USERS BY ROLE');
    console.log('======================================================');
    const rolesRes = await pool.query('SELECT role, count(*) as total_accounts FROM users GROUP BY role ORDER BY count(*) DESC');
    console.table(rolesRes.rows);

    // 3. Student Distribution Across Departments
    console.log('\n======================================================');
    console.log('🏛️ STUDENT DISTRIBUTION ACROSS DEPARTMENTS');
    console.log('======================================================');
    const branchRes = await pool.query(`
      SELECT COALESCE(branch_id, 'Unassigned') as department, count(*) as student_count 
      FROM users 
      WHERE role = 'STUDENT' 
      GROUP BY branch_id 
      ORDER BY count(*) DESC
    `);
    console.table(branchRes.rows);

    // 4. Sample Real Cohort Students
    console.log('\n======================================================');
    console.log('🎓 SAMPLE COHORT STUDENTS IN NEON');
    console.log('======================================================');
    const sampleStudents = await pool.query(`
      SELECT id, name, email, role, branch_id, skill_level, total_xp, current_streak 
      FROM users 
      WHERE role = 'STUDENT' AND email LIKE '%.@college.edu' OR email LIKE '%@college.edu'
      ORDER BY id 
      LIMIT 8
    `);
    console.table(sampleStudents.rows);

    // 5. Admin and Dean Accounts
    console.log('\n======================================================');
    console.log('🛡️ ADMINISTRATIVE & DEAN OVERSIGHT ACCOUNTS');
    console.log('======================================================');
    const staffAccounts = await pool.query(`
      SELECT id, name, email, role 
      FROM users 
      WHERE role IN ('ADMIN', 'DEAN')
    `);
    console.table(staffAccounts.rows);

    // 6. Coding Problems Catalog
    console.log('\n======================================================');
    console.log('💻 CODING PROBLEMS CATALOG IN NEON');
    console.log('======================================================');
    const codingRes = await pool.query(`
      SELECT id, title, difficulty, company_id, subject_id 
      FROM coding_problems 
      ORDER BY id 
      LIMIT 8
    `);
    console.table(codingRes.rows);

    // 7. RAG Knowledge Documents & Vector Search Index
    console.log('\n======================================================');
    console.log('🧠 RAG KNOWLEDGE BASE & FULL-TEXT SEARCH VECTORS');
    console.log('======================================================');
    const ragRes = await pool.query(`
      SELECT id, title, category, 
        CASE WHEN search_vector IS NOT NULL THEN 'Indexed (tsvector)' ELSE 'None' END as fts_index
      FROM knowledge_documents 
      LIMIT 6
    `);
    console.table(ragRes.rows);

    // 8. Live Access & Telemetry Logs
    console.log('\n======================================================');
    console.log('🌐 LIVE ACCESS LOGS & TELEMETRY IN NEON');
    console.log('======================================================');
    const logsCount = await pool.query('SELECT count(*) FROM access_logs');
    console.log(`Total Live Access Log Records: ${logsCount.rows[0].count}`);

    const latestLogs = await pool.query(`
      SELECT method, path, status_code, response_time_ms, ip, created_at 
      FROM access_logs 
      ORDER BY created_at DESC 
      LIMIT 6
    `);
    console.table(latestLogs.rows);

  } catch (err) {
    console.error('[Neon DB Error]:', err.message);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
