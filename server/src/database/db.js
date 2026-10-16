import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

let DatabaseSync = null;
let sqliteImportAttempted = false;

const loadSqliteModule = async () => {
  if (sqliteImportAttempted) return DatabaseSync;
  sqliteImportAttempted = true;
  try {
    const sqliteMod = await import('node:sqlite');
    DatabaseSync = sqliteMod.DatabaseSync;
  } catch {
    console.warn('[Database] node:sqlite not present on this runtime. Using memory store fallback.');
  }
  return DatabaseSync;
};

const memoryStore = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, 'static_fixtures.json');

/**
 * Resolves the persistent SQLite database file path.
 * Priority:
 *  1. PREPPILOT_SQLITE_PATH (explicit SQLite file path)
 *  2. PREPPILOT_DATA_PATH (.db or adjacent to .json)
 *  3. PREPPILOT_DATA_DIR / careerprep.db
 *  4. server/data/careerprep.db (default local git-ignored data directory)
 */
export const getDbFilePath = () => {
  if (process.env.PREPPILOT_SQLITE_PATH) {
    return path.resolve(process.env.PREPPILOT_SQLITE_PATH);
  }
  if (process.env.PREPPILOT_DATA_PATH) {
    const rawPath = path.resolve(process.env.PREPPILOT_DATA_PATH);
    if (rawPath.endsWith('.db') || rawPath.endsWith('.sqlite')) {
      return rawPath;
    }
    return path.join(path.dirname(rawPath), 'careerprep.db');
  }
  if (process.env.VERCEL) {
    return path.join('/tmp', 'careerprep.db');
  }
  const dataDir = process.env.PREPPILOT_DATA_DIR
    ? path.resolve(process.env.PREPPILOT_DATA_DIR)
    : path.resolve(__dirname, '../../data');
  return path.join(dataDir, 'careerprep.db');
};

const TABLE_SCHEMAS = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'STUDENT',
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `,
  questions: `
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      question TEXT,
      subject_id TEXT,
      topic_id TEXT,
      difficulty TEXT DEFAULT 'Medium',
      company_id TEXT,
      correct_answer TEXT,
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject_id);
    CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
    CREATE INDEX IF NOT EXISTS idx_questions_company ON questions(company_id);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
  `,
  questionOptions: `
    CREATE TABLE IF NOT EXISTS questionOptions (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      option_key TEXT,
      data TEXT NOT NULL,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_options_question ON questionOptions(question_id);
  `,
  codingProblems: `
    CREATE TABLE IF NOT EXISTS codingProblems (
      id TEXT PRIMARY KEY,
      title TEXT,
      difficulty TEXT DEFAULT 'Medium',
      company_id TEXT,
      subject_id TEXT,
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_coding_difficulty ON codingProblems(difficulty);
    CREATE INDEX IF NOT EXISTS idx_coding_company ON codingProblems(company_id);
    CREATE INDEX IF NOT EXISTS idx_coding_subject ON codingProblems(subject_id);
  `,
  codingTestCases: `
    CREATE TABLE IF NOT EXISTS codingTestCases (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_testcases_problem ON codingTestCases(problem_id);
  `,
  quizSessions: `
    CREATE TABLE IF NOT EXISTS quizSessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'IN_PROGRESS',
      data TEXT NOT NULL,
      created_at TEXT,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON quizSessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON quizSessions(status);
  `,
  attempts: `
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      session_id TEXT,
      data TEXT NOT NULL,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);
  `,
  accessLogs: `
    CREATE TABLE IF NOT EXISTS accessLogs (
      id TEXT PRIMARY KEY,
      ip TEXT,
      method TEXT,
      path TEXT,
      status_code INTEGER,
      response_time_ms INTEGER,
      user_agent TEXT,
      user_id TEXT,
      referrer TEXT,
      data TEXT NOT NULL,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_access_logs_created ON accessLogs(created_at);
    CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON accessLogs(ip);
  `
};

const ALL_TABLE_NAMES = [
  'users',
  'branches',
  'companies',
  'jobRoles',
  'subjects',
  'topics',
  'questions',
  'questionOptions',
  'attempts',
  'quizSessions',
  'quizQuestions',
  'studentPerformance',
  'xpHistory',
  'streaks',
  'achievements',
  'userAchievements',
  'knowledgeDocuments',
  'announcements',
  'codingProblems',
  'codingTestCases',
  'codingSubmissions',
  'codingLanguages',
  'codingBookmarks',
  'codingAssessments',
  'codingAssessmentAttempts',
  'adminInvitations',
  'facultyApplications',
  'accessLogs'
];

let sqlite = null;

/**
 * Ensures the target directory for the SQLite database exists.
 */
const ensureDataDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Ensures a table exists in SQLite.
 */
const ensureTable = (tableName) => {
  if (!sqlite) return;
  if (TABLE_SCHEMAS[tableName]) {
    sqlite.exec(TABLE_SCHEMAS[tableName]);
  } else {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      );
    `);
  }
};

/**
 * Initializes the embedded SQLite database engine.
 * Supports auto-migration from existing runtime JSON files or static fixtures.
 */
export const initDb = async () => {
  if (sqlite) return sqlite;

  await loadSqliteModule();

  // Portable fallback: If node:sqlite is not available, populate memoryStore
  if (!DatabaseSync) {
    if (Object.keys(memoryStore).length === 0 && fs.existsSync(FIXTURES_FILE)) {
      try {
        const fixtures = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8'));
        for (const [table, items] of Object.entries(fixtures)) {
          memoryStore[table] = Array.isArray(items) ? [...items] : [];
        }
        console.log('[Memory Database] Populated educational content from static fixtures.');
      } catch (err) {
        console.error('[Memory Database] Error loading fixtures:', err.message);
      }
    }
    return memoryStore;
  }

  const dbFile = getDbFilePath();
  ensureDataDirectory(dbFile);

  const isNewDb = !fs.existsSync(dbFile);
  sqlite = new DatabaseSync(dbFile);

  // WAL mode for maximum concurrent read/write throughput without file locks
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA synchronous = NORMAL;');
  sqlite.exec('PRAGMA foreign_keys = ON;');

  // Create all tables
  for (const tableName of ALL_TABLE_NAMES) {
    ensureTable(tableName);
  }

  // Check if questions table is populated
  const questionsCount = sqlite.prepare('SELECT COUNT(*) as count FROM questions').get().count;

  if (questionsCount === 0) {
    console.log('[SQLite Database] Questions table empty. Checking for bootstrap data...');

    // 1. Check if careerprep_runtime.json exists for migration
    const runtimeJsonPath = path.join(path.dirname(dbFile), 'careerprep_runtime.json');
    let loadedFromRuntime = false;

    if (fs.existsSync(runtimeJsonPath)) {
      try {
        const rawJson = fs.readFileSync(runtimeJsonPath, 'utf-8');
        const parsed = JSON.parse(rawJson);
        for (const [table, items] of Object.entries(parsed)) {
          if (Array.isArray(items) && items.length > 0) {
            ensureTable(table);
            db.insertMany(table, items);
          }
        }
        loadedFromRuntime = true;
        console.log(`[SQLite Database] Migrated existing records from JSON (${runtimeJsonPath}) to SQLite: ${dbFile}`);
      } catch (err) {
        console.warn('[SQLite Database] Could not migrate runtime JSON, falling back to fixtures:', err.message);
      }
    }

    // 2. If not migrated from runtime JSON, bootstrap from static_fixtures.json
    if (!loadedFromRuntime && fs.existsSync(FIXTURES_FILE)) {
      try {
        const rawFixtures = fs.readFileSync(FIXTURES_FILE, 'utf-8');
        const fixtures = JSON.parse(rawFixtures);
        for (const [table, items] of Object.entries(fixtures)) {
          if (Array.isArray(items) && items.length > 0) {
            ensureTable(table);
            db.insertMany(table, items);
          }
        }
        console.log('[SQLite Database] Populated educational content from static_fixtures.json into SQLite.');
      } catch (err) {
        console.error('[SQLite Database] Error loading static fixtures:', err.message);
      }
    }
  }

  // Automatic migration: normalize Dean & Admin labels and roles
  try {
    const userRows = sqlite.prepare('SELECT id, email, name, role, data FROM users').all();
    for (const u of userRows) {
      let data = {};
      try { data = JSON.parse(u.data); } catch {}
      let changed = false;

      // Normalize Admin
      if (u.email === 'admin@careerprep.ai') {
        if (u.name !== 'Administrator' || data.name !== 'Administrator') {
          u.name = 'Administrator';
          data.name = 'Administrator';
          data.designation = 'Administrator';
          changed = true;
        }
      }

      // Normalize Dean
      if (u.email === 'dean@college.edu' || u.email === 'admin@college.edu' || u.role === 'DEAN') {
        if (u.role !== 'DEAN') {
          u.role = 'DEAN';
          data.role = 'DEAN';
          changed = true;
        }
        if (u.name !== 'Dean' || data.name !== 'Dean') {
          u.name = 'Dean';
          data.name = 'Dean';
          data.designation = 'Dean';
          changed = true;
        }
      }

      // Cleanup any personal name "Ramesh Kulkarni" or "Dean of Placements" anywhere
      if (u.name && (u.name.includes('Kulkarni') || u.name.includes('Dean of Placements'))) {
        const newName = u.role === 'ADMIN' ? 'Administrator' : 'Dean';
        u.name = newName;
        data.name = newName;
        data.designation = newName;
        changed = true;
      }

      // Zero out student gamification streak and XP for Administrator and Dean accounts
      if (u.role === 'ADMIN' || u.role === 'DEAN') {
        if (data.total_xp !== 0 || data.current_streak !== 0 || data.longest_streak !== 0) {
          data.total_xp = 0;
          data.current_streak = 0;
          data.longest_streak = 0;
          data.current_level = 1;
          changed = true;
        }
      }

      if (changed) {
        sqlite.prepare(`
          UPDATE users SET name = ?, role = ?, data = ?, updated_at = ? WHERE id = ?
        `).run(u.name, u.role, JSON.stringify(data), new Date().toISOString(), u.id);
      }
    }

    // Update announcements created_by if needed
    const announcements = sqlite.prepare('SELECT id, data FROM announcements').all();
    for (const ann of announcements) {
      let data = {};
      try { data = JSON.parse(ann.data); } catch {}
      if (data.created_by && (data.created_by.includes('Kulkarni') || data.created_by.includes('Placement Dean'))) {
        data.created_by = 'Dean';
        sqlite.prepare('UPDATE announcements SET data = ? WHERE id = ?').run(JSON.stringify(data), ann.id);
      }
    }
  } catch (migErr) {
    // Migration check fails gracefully if tables are still initializing
  }

  console.log(`[SQLite Database] Embedded SQLite engine initialized at: ${dbFile}`);
  return sqlite;
};

/**
 * Checkpoint WAL to main SQLite file safely.
 */
export const saveDb = () => {
  if (sqlite) {
    try {
      sqlite.exec('PRAGMA wal_checkpoint(PASSIVE);');
    } catch {
      // Passive checkpoint
    }
  }
};

/**
 * Helper to extract specialized typed columns for specific tables.
 */
const insertRow = (table, item) => {
  ensureTable(table);
  const now = new Date().toISOString();
  const id = item.id || uuidv4();
  const itemWithId = { ...item, id };
  const jsonStr = JSON.stringify(itemWithId);

  if (table === 'users') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO users (id, email, name, role, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.email || null,
      item.name || null,
      item.role || 'STUDENT',
      jsonStr,
      item.created_at || now,
      now
    );
  } else if (table === 'questions') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO questions (id, question, subject_id, topic_id, difficulty, company_id, correct_answer, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.question || '',
      item.subject_id || null,
      item.topic_id || null,
      item.difficulty || 'Medium',
      item.company_id || null,
      item.correct_answer || null,
      jsonStr,
      item.created_at || now,
      now
    );
  } else if (table === 'questionOptions') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO questionOptions (id, question_id, option_key, data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      item.question_id || null,
      item.option_key || null,
      jsonStr,
      item.created_at || now
    );
  } else if (table === 'codingProblems') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO codingProblems (id, title, difficulty, company_id, subject_id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.title || '',
      item.difficulty || 'Medium',
      item.company_id || null,
      item.subject_id || null,
      jsonStr,
      item.created_at || now,
      now
    );
  } else if (table === 'codingTestCases') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO codingTestCases (id, problem_id, data, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      id,
      item.problem_id || null,
      jsonStr,
      item.created_at || now
    );
  } else if (table === 'quizSessions') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO quizSessions (id, user_id, status, data, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.user_id || null,
      item.status || 'IN_PROGRESS',
      jsonStr,
      item.created_at || now,
      item.completed_at || null
    );
  } else if (table === 'attempts') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO attempts (id, user_id, question_id, session_id, data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.user_id || null,
      item.question_id || null,
      item.session_id || null,
      jsonStr,
      item.created_at || now
    );
  } else if (table === 'accessLogs') {
    sqlite.prepare(`
      INSERT OR REPLACE INTO accessLogs (id, ip, method, path, status_code, response_time_ms, user_agent, user_id, referrer, data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.ip || null,
      item.method || 'GET',
      item.path || '/',
      item.status_code || 200,
      item.response_time_ms || 0,
      item.user_agent || null,
      item.user_id || null,
      item.referrer || null,
      jsonStr,
      item.created_at || now
    );
  } else {
    sqlite.prepare(`
      INSERT OR REPLACE INTO "${table}" (id, data, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(
      id,
      jsonStr,
      item.created_at || now,
      now
    );
  }

  return itemWithId;
};

// Generic CRUD API backed by SQLite
export const db = {
  get: (table, id) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      return (memoryStore[table] || []).find(x => x.id === id) || null;
    }
    ensureTable(table);
    try {
      const row = sqlite.prepare(`SELECT data FROM "${table}" WHERE id = ?`).get(id);
      return row ? JSON.parse(row.data) : null;
    } catch {
      return null;
    }
  },

  getAll: (table) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      return memoryStore[table] || [];
    }
    ensureTable(table);
    try {
      const rows = sqlite.prepare(`SELECT data FROM "${table}"`).all();
      return rows.map(r => JSON.parse(r.data));
    } catch {
      return [];
    }
  },

  find: (table, predicate) => {
    return db.getAll(table).filter(predicate);
  },

  findOne: (table, predicate) => {
    return db.getAll(table).find(predicate) || null;
  },

  insert: (table, item) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      if (!memoryStore[table]) memoryStore[table] = [];
      const itemWithId = { ...item, id: item.id || uuidv4() };
      memoryStore[table].push(itemWithId);
      return itemWithId;
    }
    return insertRow(table, item);
  },

  insertMany: (table, items) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      if (!Array.isArray(items)) return [];
      if (!memoryStore[table]) memoryStore[table] = [];
      const inserted = items.map(item => ({ ...item, id: item.id || uuidv4() }));
      memoryStore[table].push(...inserted);
      return inserted;
    }
    ensureTable(table);
    if (!Array.isArray(items) || items.length === 0) return items;

    sqlite.exec('BEGIN TRANSACTION');
    try {
      const results = [];
      for (const item of items) {
        results.push(insertRow(table, item));
      }
      sqlite.exec('COMMIT');
      return results;
    } catch (err) {
      sqlite.exec('ROLLBACK');
      throw err;
    }
  },

  update: (table, id, updates) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      if (!memoryStore[table]) return null;
      const idx = memoryStore[table].findIndex(x => x.id === id);
      if (idx === -1) return null;
      memoryStore[table][idx] = { ...memoryStore[table][idx], ...updates, updated_at: new Date().toISOString() };
      return memoryStore[table][idx];
    }
    const existing = db.get(table, id);
    if (!existing) return null;
    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
    insertRow(table, merged);
    return merged;
  },

  delete: (table, id) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      if (!memoryStore[table]) return false;
      const initial = memoryStore[table].length;
      memoryStore[table] = memoryStore[table].filter(x => x.id !== id);
      return memoryStore[table].length < initial;
    }
    ensureTable(table);
    try {
      const result = sqlite.prepare(`DELETE FROM "${table}" WHERE id = ?`).run(id);
      return result.changes > 0;
    } catch {
      return false;
    }
  },

  replaceAll: (table, items) => {
    if (!sqlite) initDb();
    if (!sqlite) {
      memoryStore[table] = Array.isArray(items) ? [...items] : [];
      return memoryStore[table];
    }
    ensureTable(table);
    sqlite.exec(`DELETE FROM "${table}"`);
    return db.insertMany(table, items);
  },

  // Direct SQL execution methods
  query: (sql, params = []) => {
    if (!sqlite) initDb();
    if (!sqlite) return [];
    return sqlite.prepare(sql).all(...params);
  },

  execute: (sql, params = []) => {
    if (!sqlite) initDb();
    if (!sqlite) return { changes: 0 };
    return sqlite.prepare(sql).run(...params);
  },

  // Raw store accessor via Proxy for backwards compatibility
  getStore: () => new Proxy({}, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return db.getAll(prop);
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (typeof prop === 'string' && Array.isArray(value)) {
        db.replaceAll(prop, value);
        return true;
      }
      target[prop] = value;
      return true;
    }
  }),

  setStore: (newStore) => {
    if (!sqlite) initDb();
    if (newStore && typeof newStore === 'object') {
      for (const [table, items] of Object.entries(newStore)) {
        if (Array.isArray(items)) {
          db.replaceAll(table, items);
        }
      }
    }
  }
};

export default db;
