import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'careerprep_data.json');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const OUTPUT_SQL_FILE = path.join(__dirname, 'migration_dump.sql');

export const generateMigration = () => {
  console.log('[Migration] Starting PostgreSQL migration plan generation...');

  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Data file not found at ${DATA_FILE}`);
  }

  // 1. Create a safe timestamped backup of the active JSON store
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, `careerprep_data.backup-${timestamp}.json`);
  fs.copyFileSync(DATA_FILE, backupFile);
  console.log(`[Migration] Verified safe backup created at: ${backupFile}`);

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const store = JSON.parse(raw);

  let sql = `-- ==========================================================\n`;
  sql += `-- PrepPilot AI - PostgreSQL Data Migration Script\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- Source: careerprep_data.json (Backup: ${path.basename(backupFile)})\n`;
  sql += `-- ==========================================================\n\n`;
  sql += `BEGIN;\n\n`;

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

  // Helper to generate bulk insert
  const generateInserts = (tableName, items, columns, mapper) => {
    if (!items || items.length === 0) return;
    sql += `-- Table: ${tableName} (${items.length} records)\n`;
    for (const item of items) {
      const vals = mapper(item);
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
    sql += `\n`;
  };

  // 1. Branches
  generateInserts('branches', store.branches, ['id', 'name', 'code', 'description'], b => [
    escapeStr(b.id), escapeStr(b.name), escapeStr(b.code), escapeStr(b.description)
  ]);

  // 2. Companies
  generateInserts('companies', store.companies, ['id', 'name', 'tier', 'pattern_description', 'website', 'logo_icon', 'hiring_rounds'], c => [
    escapeStr(c.id), escapeStr(c.name), escapeStr(c.tier), escapeStr(c.pattern_description), escapeStr(c.website), escapeStr(c.logo_icon), escapeStr(c.hiring_rounds)
  ]);

  // 3. Job Roles
  generateInserts('job_roles', store.jobRoles, ['id', 'title', 'branch_id', 'description', 'expected_skills'], j => [
    escapeStr(j.id), escapeStr(j.title), escapeStr(j.branch_id), escapeStr(j.description), escapeStr(j.expected_skills)
  ]);

  // 4. Users
  generateInserts('users', store.users, ['id', 'name', 'email', 'password_hash', 'role', 'branch_id', 'skill_level', 'total_xp', 'current_level', 'current_streak'], u => [
    escapeStr(u.id), escapeStr(u.name), escapeStr(u.email), escapeStr(u.password_hash || '$2a$10$demoHashPlaceholder'), escapeStr(u.role || 'STUDENT'), escapeStr(u.branch_id), escapeStr(u.skill_level || 'Intermediate'), escapeStr(u.total_xp || 0), escapeStr(u.current_level || 1), escapeStr(u.current_streak || 0)
  ]);

  // 5. Subjects
  generateInserts('subjects', store.subjects, ['id', 'name', 'code', 'branch_id', 'description', 'icon'], s => [
    escapeStr(s.id), escapeStr(s.name), escapeStr(s.code), escapeStr(s.branch_id), escapeStr(s.description), escapeStr(s.icon)
  ]);

  // 6. Topics
  generateInserts('topics', store.topics, ['id', 'subject_id', 'name', 'description', 'importance_weight'], t => [
    escapeStr(t.id), escapeStr(t.subject_id), escapeStr(t.name), escapeStr(t.description), escapeStr(t.importance_weight || 1.0)
  ]);

  // 7. Coding Problems
  generateInserts('coding_problems', store.codingProblems, [
    'id', 'title', 'difficulty', 'branch_id', 'company_id', 'subject_id', 'topic_id', 'tags', 'description', 'constraints', 'time_limit_ms', 'memory_limit_mb', 'starter_code', 'hints', 'editorial'
  ], p => [
    escapeStr(p.id), escapeStr(p.title), escapeStr(p.difficulty), escapeStr(p.branch_id), escapeStr(p.company_id), escapeStr(p.subject_id), escapeStr(p.topic_id), escapeStr(p.tags), escapeStr(p.description), escapeStr(p.constraints), escapeStr(p.timeLimit || 2000), escapeStr(p.memoryLimit || 256), escapeStr(p.starterCode), escapeStr(p.hints), escapeStr(p.editorial)
  ]);

  // 8. Coding Test Cases
  generateInserts('coding_test_cases', store.codingTestCases, ['id', 'problem_id', 'input', 'expected_output', 'is_hidden', 'explanation'], tc => [
    escapeStr(tc.id), escapeStr(tc.problem_id), escapeStr(tc.input), escapeStr(tc.expectedOutput), escapeStr(tc.isHidden || false), escapeStr(tc.explanation)
  ]);

  // 9. Coding Submissions
  generateInserts('coding_submissions', store.codingSubmissions, ['id', 'user_id', 'problem_id', 'language', 'code', 'status', 'passed_cases', 'total_cases', 'runtime_ms', 'memory_kb', 'assessment_id'], sub => [
    escapeStr(sub.id), escapeStr(sub.user_id), escapeStr(sub.problem_id), escapeStr(sub.language), escapeStr(sub.code), escapeStr(sub.status), escapeStr(sub.passed_cases || 0), escapeStr(sub.total_cases || 0), escapeStr(sub.runtime_ms || 0), escapeStr(sub.memory_kb || 0), escapeStr(sub.assessment_id)
  ]);

  // 10. Coding Bookmarks
  generateInserts('coding_bookmarks', store.codingBookmarks, ['id', 'user_id', 'problem_id'], bm => [
    escapeStr(bm.id), escapeStr(bm.user_id), escapeStr(bm.problem_id)
  ]);

  // 11. Coding Assessments
  generateInserts('coding_assessments', store.codingAssessments, ['id', 'title', 'description', 'company', 'duration_minutes', 'difficulty', 'total_marks', 'problem_ids', 'tags'], a => [
    escapeStr(a.id), escapeStr(a.title), escapeStr(a.description), escapeStr(a.company), escapeStr(a.duration_minutes || 45), escapeStr(a.difficulty || 'Medium'), escapeStr(a.total_marks || 100), escapeStr(a.problem_ids), escapeStr(a.tags)
  ]);

  // 12. Coding Assessment Attempts
  generateInserts('coding_assessment_attempts', store.codingAssessmentAttempts, ['id', 'assessment_id', 'user_id', 'duration_minutes', 'status', 'score', 'answers'], att => [
    escapeStr(att.id), escapeStr(att.assessment_id), escapeStr(att.user_id), escapeStr(att.duration_minutes || 45), escapeStr(att.status || 'IN_PROGRESS'), escapeStr(att.score || 0), escapeStr(att.answers)
  ]);

  sql += `COMMIT;\n`;

  fs.writeFileSync(OUTPUT_SQL_FILE, sql, 'utf-8');
  console.log(`[Migration] SQL migration file successfully generated: ${OUTPUT_SQL_FILE}`);
  console.log(`[Migration] To execute directly on PostgreSQL:\n  psql -d $DATABASE_URL -f ${SCHEMA_FILE}\n  psql -d $DATABASE_URL -f ${OUTPUT_SQL_FILE}`);

  return { backupFile, sqlFile: OUTPUT_SQL_FILE };
};

// Auto-run if executed as CLI
if (process.argv[1] && process.argv[1].endsWith('migrateToPostgres.js')) {
  generateMigration();
}
