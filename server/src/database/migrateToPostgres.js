import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import db, { initDb, getDbFilePath } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const OUTPUT_SQL_FILE = path.join(__dirname, 'migration_dump.sql');

/**
 * Escapes values safely for PostgreSQL SQL statements.
 */
const escapeStr = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
};

/**
 * Generates an SQL dump file migrating all active SQLite data into PostgreSQL format.
 */
export const generateMigration = async (executeDirectly = false) => {
  console.log('[PostgreSQL Migration] Initializing active database source...');
  await initDb();

  const dataFile = getDbFilePath();
  console.log(`[PostgreSQL Migration] Reading records from: ${dataFile}`);

  let sql = `-- ==========================================================\n`;
  sql += `-- PrepPilot AI - Automated PostgreSQL Data Migration Script\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Source Database: SQLite (${path.basename(dataFile)})\n`;
  sql += `-- ==========================================================\n\n`;
  sql += `BEGIN;\n\n`;

  const generateInserts = (tableName, items, columns, mapper) => {
    if (!items || items.length === 0) return;
    sql += `-- Table: ${tableName} (${items.length} records)\n`;
    for (const item of items) {
      const vals = mapper(item);
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${columns.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ')};\n`;
    }
    sql += `\n`;
  };

  // 1. Branches
  const branches = db.getAll('branches');
  const knownBranchIds = new Set(branches.map(b => b.id));
  generateInserts('branches', branches, ['id', 'name', 'code', 'description'], b => [
    escapeStr(b.id), escapeStr(b.name), escapeStr(b.code), escapeStr(b.description)
  ]);

  // 2. Companies
  const companies = db.getAll('companies');
  const knownCompanyIds = new Set(companies.map(c => c.id));
  generateInserts('companies', companies, ['id', 'name', 'tier', 'pattern_description', 'website', 'logo_icon', 'hiring_rounds'], c => [
    escapeStr(c.id), escapeStr(c.name), escapeStr(c.tier || 'Product/Service'), escapeStr(c.pattern_description), escapeStr(c.website), escapeStr(c.logo_icon), escapeStr(c.hiring_rounds || [])
  ]);

  // 3. Job Roles
  const jobRoles = db.getAll('jobRoles');
  generateInserts('job_roles', jobRoles, ['id', 'title', 'branch_id', 'description', 'expected_skills'], j => [
    escapeStr(j.id), escapeStr(j.title), escapeStr(j.branch_id), escapeStr(j.description), escapeStr(j.expected_skills || [])
  ]);

  // 4. Users
  const users = db.getAll('users');
  generateInserts('users', users, [
    'id', 'name', 'email', 'password_hash', 'role', 'branch_id', 'year', 'graduation_year',
    'skill_level', 'areas_of_interest', 'target_companies', 'total_xp', 'current_level', 'current_streak'
  ], u => [
    escapeStr(u.id), escapeStr(u.name), escapeStr(u.email), escapeStr(u.password_hash || '$2a$10$demoHashPlaceholder'),
    escapeStr(u.role || 'STUDENT'), escapeStr(u.branch_id), escapeStr(u.year || '4th Year'), escapeStr(u.graduation_year || 2026),
    escapeStr(u.skill_level || 'Intermediate'), escapeStr(u.areas_of_interest || []), escapeStr(u.target_companies || []),
    escapeStr(u.total_xp || 0), escapeStr(u.current_level || 1), escapeStr(u.current_streak || 0)
  ]);

  // 5. Subjects
  const subjects = db.getAll('subjects');
  const knownSubjectIds = new Set(subjects.map(s => s.id));
  generateInserts('subjects', subjects, ['id', 'name', 'code', 'branch_id', 'description', 'icon'], s => [
    escapeStr(s.id), escapeStr(s.name), escapeStr(s.code), escapeStr(knownBranchIds.has(s.branch_id) ? s.branch_id : null), escapeStr(s.description), escapeStr(s.icon)
  ]);

  // 6. Topics
  const topics = db.getAll('topics');
  const knownTopicIds = new Set(topics.map(t => t.id));
  const extraTopics = [
    { id: 'top-stack-queue', subject_id: 'sub-dsa', name: 'Stacks & Queues', description: 'LIFO, FIFO, monotonic queues and stack evaluation', importance_weight: 1.0 },
    { id: 'top-searching-sorting', subject_id: 'sub-dsa', name: 'Searching & Sorting', description: 'Binary search, merge sort, quick sort and variants', importance_weight: 1.0 },
    { id: 'top-strings', subject_id: 'sub-dsa', name: 'String Algorithms', description: 'String manipulation, two-pointer, hashing and palindromes', importance_weight: 1.0 }
  ];
  for (const et of extraTopics) {
    if (!knownTopicIds.has(et.id)) {
      topics.push(et);
      knownTopicIds.add(et.id);
    }
  }
  generateInserts('topics', topics, ['id', 'subject_id', 'name', 'description', 'importance_weight'], t => [
    escapeStr(t.id), escapeStr(knownSubjectIds.has(t.subject_id) ? t.subject_id : null), escapeStr(t.name), escapeStr(t.description), escapeStr(t.importance_weight || 1.0)
  ]);

  // 7. Questions
  const questions = db.getAll('questions');
  generateInserts('questions', questions, [
    'id', 'question', 'question_type', 'branch_id', 'company_id', 'subject_id', 'topic_id',
    'difficulty', 'correct_answer', 'explanation', 'tags', 'expected_time', 'xp_value'
  ], q => [
    escapeStr(q.id), escapeStr(q.question), escapeStr(q.question_type || 'MCQ'),
    escapeStr(knownBranchIds.has(q.branch_id) ? q.branch_id : null),
    escapeStr(knownCompanyIds.has(q.company_id) ? q.company_id : null),
    escapeStr(knownSubjectIds.has(q.subject_id) ? q.subject_id : null),
    escapeStr(knownTopicIds.has(q.topic_id) ? q.topic_id : null),
    escapeStr(q.difficulty || 'Medium'),
    escapeStr(q.correct_answer), escapeStr(q.explanation), escapeStr(q.tags || []), escapeStr(q.expected_time || 60), escapeStr(q.xp_value || 20)
  ]);

  // 8. Question Options
  const questionOptions = db.getAll('questionOptions');
  const knownQuestionIds = new Set(questions.map(q => q.id));
  const validOptions = questionOptions.filter(opt => knownQuestionIds.has(opt.question_id));
  generateInserts('question_options', validOptions, ['id', 'question_id', 'option_key', 'option_text', 'is_correct', 'explanation'], opt => [
    escapeStr(opt.id), escapeStr(opt.question_id), escapeStr(opt.option_key), escapeStr(opt.option_text), escapeStr(Boolean(opt.is_correct)), escapeStr(opt.explanation)
  ]);

  // 9. Knowledge Documents (RAG)
  const knowledgeDocs = db.getAll('knowledgeDocuments');
  generateInserts('knowledge_documents', knowledgeDocs, ['id', 'title', 'branch_id', 'subject_id', 'company_id', 'category', 'content', 'summary', 'keywords'], kd => [
    escapeStr(kd.id), escapeStr(kd.title),
    escapeStr(knownBranchIds.has(kd.branch_id) ? kd.branch_id : null),
    escapeStr(knownSubjectIds.has(kd.subject_id) ? kd.subject_id : null),
    escapeStr(knownCompanyIds.has(kd.company_id) ? kd.company_id : null),
    escapeStr(kd.category || 'CONCEPT'), escapeStr(kd.content), escapeStr(kd.summary), escapeStr(kd.keywords || [])
  ]);

  // 10. Coding Problems
  const codingProblems = db.getAll('codingProblems');
  const knownProblemIds = new Set(codingProblems.map(p => p.id));
  generateInserts('coding_problems', codingProblems, [
    'id', 'title', 'difficulty', 'branch_id', 'company_id', 'subject_id', 'topic_id', 'tags',
    'description', 'constraints', 'time_limit_ms', 'memory_limit_mb', 'starter_code', 'hints', 'editorial'
  ], p => [
    escapeStr(p.id), escapeStr(p.title), escapeStr(p.difficulty || 'Medium'),
    escapeStr(knownBranchIds.has(p.branch_id) ? p.branch_id : null),
    escapeStr(knownCompanyIds.has(p.company_id) ? p.company_id : null),
    escapeStr(knownSubjectIds.has(p.subject_id) ? p.subject_id : null),
    escapeStr(knownTopicIds.has(p.topic_id) ? p.topic_id : null),
    escapeStr(p.tags || []), escapeStr(p.description), escapeStr(p.constraints),
    escapeStr(p.time_limit_ms || p.timeLimit || 2000), escapeStr(p.memory_limit_mb || p.memoryLimit || 256),
    escapeStr(p.starter_code || p.starterCode || {}), escapeStr(p.hints || []), escapeStr(p.editorial || {})
  ]);

  // 11. Coding Test Cases
  const codingTestCases = db.getAll('codingTestCases');
  const validTestCases = codingTestCases.filter(tc => knownProblemIds.has(tc.problem_id));
  generateInserts('coding_test_cases', validTestCases, ['id', 'problem_id', 'input', 'expected_output', 'is_hidden', 'explanation'], tc => [
    escapeStr(tc.id), escapeStr(tc.problem_id), escapeStr(tc.input), escapeStr(tc.expected_output || tc.expectedOutput),
    escapeStr(Boolean(tc.is_hidden || tc.isHidden)), escapeStr(tc.explanation)
  ]);

  // 12. Coding Assessments
  const codingAssessments = db.getAll('codingAssessments');
  generateInserts('coding_assessments', codingAssessments, ['id', 'title', 'description', 'company', 'duration_minutes', 'difficulty', 'total_marks', 'problem_ids', 'tags'], a => [
    escapeStr(a.id), escapeStr(a.title), escapeStr(a.description), escapeStr(a.company), escapeStr(a.duration_minutes || 45),
    escapeStr(a.difficulty || 'Medium'), escapeStr(a.total_marks || 100), escapeStr(a.problem_ids || []), escapeStr(a.tags || [])
  ]);

  // 13. Achievements
  const achievements = db.getAll('achievements');
  generateInserts('achievements', achievements, ['id', 'title', 'description', 'badge_icon', 'category', 'xp_reward', 'condition_type', 'threshold'], ach => [
    escapeStr(ach.id), escapeStr(ach.title), escapeStr(ach.description), escapeStr(ach.badge_icon || ach.icon || 'Rocket'),
    escapeStr(ach.category || 'PRACTICE'), escapeStr(ach.xp_reward || 50), escapeStr(ach.condition_type || 'QUIZ_COUNT'), escapeStr(ach.threshold || 1)
  ]);

  sql += `COMMIT;\n`;

  fs.writeFileSync(OUTPUT_SQL_FILE, sql, 'utf-8');
  console.log(`[PostgreSQL Migration] Generated complete migration file at: ${OUTPUT_SQL_FILE}`);
  console.log(`[PostgreSQL Migration] Records migrated:`);
  console.log(`  - Questions: ${questions.length}`);
  console.log(`  - Options: ${questionOptions.length}`);
  console.log(`  - Coding Problems: ${codingProblems.length}`);
  console.log(`  - Test Cases: ${codingTestCases.length}`);
  console.log(`  - Users: ${users.length}`);
  console.log(`  - Knowledge Documents (RAG): ${knowledgeDocs.length}`);

  // If DATABASE_URL is present and execution was requested, run against live PostgreSQL
  if (executeDirectly && process.env.DATABASE_URL) {
    console.log('[PostgreSQL Migration] Executing schema DDL and data migration against PostgreSQL...');
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } });
    try {
      const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
      await pool.query(schemaSql);
      console.log('  ✓ PostgreSQL Schema DDL executed successfully.');
      await pool.query(sql);
      console.log('  ✓ PostgreSQL Data Migration executed successfully.');
    } catch (err) {
      console.error('[PostgreSQL Migration Error]:', err.message);
      throw err;
    } finally {
      await pool.end();
    }
  }

  return { sqlFile: OUTPUT_SQL_FILE, schemaFile: SCHEMA_FILE };
};

// Run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('migrateToPostgres.js')) {
  const shouldExecute = process.argv.includes('--execute') || process.argv.includes('-e');
  generateMigration(shouldExecute).catch(console.error);
}
