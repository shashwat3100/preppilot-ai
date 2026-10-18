import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

import { initDb, default as db } from '../src/database/db.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZrdW6cUlhE1F@ep-dark-mountain-b4w8hfn7-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Helper to batch insert records
async function batchInsert(client, table, columns, records, onConflict = 'DO NOTHING') {
  if (!records || records.length === 0) return 0;
  const BATCH_SIZE = 75; // Safe parameter count (< 65535 limit)
  let inserted = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE);
    const valuePlaceholders = [];
    const values = [];

    chunk.forEach((row, rowIdx) => {
      const rowPlaceholders = [];
      columns.forEach((col, colIdx) => {
        const paramIndex = rowIdx * columns.length + colIdx + 1;
        rowPlaceholders.push(`$${paramIndex}`);
        values.push(row[col]);
      });
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    });

    const query = `
      INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
      VALUES ${valuePlaceholders.join(', ')}
      ON CONFLICT (id) ${onConflict};
    `;

    await client.query(query, values);
    inserted += chunk.length;
  }
  return inserted;
}

async function syncToNeon() {
  console.log('[Neon Sync] Initializing local database...');
  await initDb();

  console.log('[Neon Sync] Connecting to Neon cloud PostgreSQL...');
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    // 0. Update mode check constraint to include TIMED_ASSESSMENT
    await client.query(`
      ALTER TABLE quiz_sessions DROP CONSTRAINT IF EXISTS quiz_sessions_mode_check;
      ALTER TABLE quiz_sessions ADD CONSTRAINT quiz_sessions_mode_check 
        CHECK (mode IN ('ADAPTIVE_DAILY', 'CUSTOM_PRACTICE', 'COMPANY_PATTERN', 'TIMED_ASSESSMENT', 'ASSESSMENT'));
    `);
    console.log('[Neon Sync] Checked quiz_sessions_mode_check constraint.');

    // 1. Get valid foreign keys in Neon
    const userRes = await client.query('SELECT id FROM users');
    const validUserIds = new Set(userRes.rows.map(r => r.id));

    const questionRes = await client.query('SELECT id FROM questions');
    const validQuestionIds = new Set(questionRes.rows.map(r => r.id));

    const topicRes = await client.query('SELECT id FROM topics');
    const validTopicIds = new Set(topicRes.rows.map(r => r.id));

    const subjectRes = await client.query('SELECT id FROM subjects');
    const validSubjectIds = new Set(subjectRes.rows.map(r => r.id));

    const codingProblemsRes = await client.query('SELECT id FROM coding_problems');
    const validProblemIds = new Set(codingProblemsRes.rows.map(r => r.id));

    // 2. Sync Quiz Sessions
    const sessions = db.getAll('quizSessions') || [];
    const validSessions = sessions
      .filter(s => validUserIds.has(s.user_id))
      .map(s => {
        const mode = ['ADAPTIVE_DAILY', 'CUSTOM_PRACTICE', 'COMPANY_PATTERN', 'TIMED_ASSESSMENT', 'ASSESSMENT'].includes(s.mode)
          ? s.mode
          : 'CUSTOM_PRACTICE';
        return {
          id: s.id,
          user_id: s.user_id,
          mode,
          status: s.status || 'COMPLETED',
          total_questions: s.total_questions || 10,
          correct_count: s.correct_count || 0,
          score: s.score || 0,
          xp_earned: s.xp_earned || 0,
          time_taken_seconds: s.time_taken_seconds || 60,
          config_params: s.config_params ? JSON.stringify(s.config_params) : null,
          created_at: s.created_at || new Date().toISOString(),
          completed_at: s.completed_at || s.updated_at || new Date().toISOString()
        };
      });

    const sessionCols = [
      'id', 'user_id', 'mode', 'status', 'total_questions', 'correct_count', 
      'score', 'xp_earned', 'time_taken_seconds', 'config_params', 'created_at', 'completed_at'
    ];
    console.log(`[Neon Sync] Batch syncing ${validSessions.length} quiz sessions...`);
    const syncedSessions = await batchInsert(client, 'quiz_sessions', sessionCols, validSessions);
    console.log(`[Neon Sync] Synced ${syncedSessions} quiz sessions.`);

    // 3. Sync Attempts
    const validSessionIds = new Set(validSessions.map(s => s.id));
    const attempts = db.getAll('attempts') || [];
    const validAttempts = attempts
      .filter(a => 
        validUserIds.has(a.user_id) && 
        validQuestionIds.has(a.question_id) &&
        (!a.session_id || validSessionIds.has(a.session_id))
      )
      .map(a => ({
        id: a.id,
        user_id: a.user_id,
        question_id: a.question_id,
        session_id: a.session_id || null,
        user_answer: a.user_answer || '',
        is_correct: Boolean(a.is_correct),
        time_spent_seconds: a.time_spent_seconds || 30,
        xp_gained: a.xp_gained || (a.is_correct ? 25 : 5),
        attempted_at: a.attempted_at || a.created_at || new Date().toISOString()
      }));

    const attemptCols = [
      'id', 'user_id', 'question_id', 'session_id', 'user_answer', 'is_correct', 
      'time_spent_seconds', 'xp_gained', 'attempted_at'
    ];
    console.log(`[Neon Sync] Batch syncing ${validAttempts.length} question attempts...`);
    const syncedAttempts = await batchInsert(client, 'attempts', attemptCols, validAttempts);
    console.log(`[Neon Sync] Synced ${syncedAttempts} attempts.`);

    // 4. Sync Student Performance
    const performance = db.getAll('studentPerformance') || [];
    const validPerformance = performance
      .filter(p => 
        validUserIds.has(p.user_id) && 
        validTopicIds.has(p.topic_id) && 
        validSubjectIds.has(p.subject_id)
      )
      .map(p => ({
        id: p.id,
        user_id: p.user_id,
        topic_id: p.topic_id,
        subject_id: p.subject_id,
        attempts_count: p.attempts_count || 1,
        correct_count: p.correct_count || 0,
        accuracy_rate: p.accuracy_rate !== undefined ? parseFloat(p.accuracy_rate) : 0,
        weakness_score: p.weakness_score !== undefined ? parseFloat(p.weakness_score) : 0.5,
        last_attempted_at: p.last_attempted_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
      }));

    const perfCols = [
      'id', 'user_id', 'topic_id', 'subject_id', 'attempts_count', 'correct_count', 
      'accuracy_rate', 'weakness_score', 'last_attempted_at', 'updated_at'
    ];
    console.log(`[Neon Sync] Batch syncing ${validPerformance.length} student performance records...`);
    const syncedPerf = await batchInsert(client, 'student_performance', perfCols, validPerformance);
    console.log(`[Neon Sync] Synced ${syncedPerf} student performance records.`);

    // 5. Sync Coding Submissions
    const coding = db.getAll('codingSubmissions') || [];
    const validCoding = coding
      .filter(c => 
        validUserIds.has(c.user_id) && 
        validProblemIds.has(c.problem_id)
      )
      .map(c => ({
        id: c.id,
        user_id: c.user_id,
        problem_id: c.problem_id,
        language: c.language || 'javascript',
        code: c.code || '// submitted code',
        status: c.status || 'ACCEPTED',
        passed_cases: c.passed_cases !== undefined ? c.passed_cases : (c.passed_count || 0),
        total_cases: c.total_cases !== undefined ? c.total_cases : (c.total_count || 5),
        runtime_ms: c.runtime_ms !== undefined ? c.runtime_ms : (c.execution_time || 120),
        memory_kb: c.memory_kb !== undefined ? c.memory_kb : (c.memory_used || null),
        assessment_id: c.assessment_id || null,
        created_at: c.created_at || c.submitted_at || new Date().toISOString()
      }));

    const codingCols = [
      'id', 'user_id', 'problem_id', 'language', 'code', 'status', 
      'passed_cases', 'total_cases', 'runtime_ms', 'memory_kb', 'assessment_id', 'created_at'
    ];
    console.log(`[Neon Sync] Batch syncing ${validCoding.length} coding submissions...`);
    const syncedCoding = await batchInsert(client, 'coding_submissions', codingCols, validCoding);
    console.log(`[Neon Sync] Synced ${syncedCoding} coding submissions.`);

    console.log('\n======================================================');
    console.log('🎉 SYNC COMPLETE! NEON CLOUD DATABASE IS FULLY POPULATED');
    console.log('======================================================');
  } catch (err) {
    console.error('[Neon Sync Error]:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

syncToNeon().catch(console.error);
