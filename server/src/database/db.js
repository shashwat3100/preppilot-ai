import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, 'static_fixtures.json');

/**
 * Resolves the persistent runtime database file path.
 * Priority:
 *  1. PREPPILOT_DATA_PATH (explicit file path)
 *  2. PREPPILOT_DATA_DIR / careerprep_runtime.json
 *  3. server/data/careerprep_runtime.json (default ignored local data directory)
 */
export const getDbFilePath = () => {
  if (process.env.PREPPILOT_DATA_PATH) {
    return path.resolve(process.env.PREPPILOT_DATA_PATH);
  }
  const dataDir = process.env.PREPPILOT_DATA_DIR
    ? path.resolve(process.env.PREPPILOT_DATA_DIR)
    : path.resolve(__dirname, '../../data');
  return path.join(dataDir, 'careerprep_runtime.json');
};

const createEmptyStore = () => ({
  users: [],
  branches: [],
  companies: [],
  jobRoles: [],
  subjects: [],
  topics: [],
  questions: [],
  questionOptions: [],
  attempts: [],
  quizSessions: [],
  quizQuestions: [],
  studentPerformance: [],
  xpHistory: [],
  streaks: [],
  achievements: [],
  userAchievements: [],
  knowledgeDocuments: [],
  announcements: [],
  codingProblems: [],
  codingTestCases: [],
  codingSubmissions: [],
  codingLanguages: [],
  codingBookmarks: [],
  codingAssessments: [],
  codingAssessmentAttempts: [],
  adminInvitations: [],
  facultyApplications: []
});

// In-memory store backed by persistent runtime JSON file
let store = createEmptyStore();

/**
 * Ensures the target directory for the runtime database exists.
 */
const ensureDataDirectory = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Load existing runtime data if available.
 * If no runtime file exists, bootstrap with static educational fixtures.
 * Fatal read errors are thrown to prevent silently overwriting corrupted stores.
 */
export const initDb = async () => {
  const dbFile = getDbFilePath();
  ensureDataDirectory(dbFile);

  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      store = { ...createEmptyStore(), ...parsed };
      console.log(`[Database] Loaded persistent runtime data from ${dbFile}`);
    } catch (err) {
      console.error(`[Database CRITICAL] Failed to read or parse database file at ${dbFile}:`, err.message);
      // Fail explicitly: do NOT silently proceed with an empty store as that could overwrite corrupted data
      throw new Error(`[Database] Cannot start: unreadable database at ${dbFile}. Details: ${err.message}`);
    }
  } else {
    // 1. Check if a local legacy database exists to migrate local user records
    const legacyPath = path.resolve(__dirname, 'careerprep_data.json');
    if (fs.existsSync(legacyPath)) {
      try {
        const rawLegacy = fs.readFileSync(legacyPath, 'utf-8');
        const legacyParsed = JSON.parse(rawLegacy);
        store = { ...createEmptyStore(), ...legacyParsed };
        saveDb();
        console.log(`[Database] Migrated existing local database records to ignored runtime path: ${dbFile}`);
        return;
      } catch (legacyErr) {
        console.warn('[Database] Could not migrate legacy database file, falling back to static fixtures:', legacyErr.message);
      }
    }

    // 2. Fresh initialization from verified static educational fixtures
    store = createEmptyStore();
    if (fs.existsSync(FIXTURES_FILE)) {
      try {
        const rawFixtures = fs.readFileSync(FIXTURES_FILE, 'utf-8');
        const fixtures = JSON.parse(rawFixtures);
        store = { ...store, ...fixtures };
        console.log(`[Database] Initialized new runtime database from static educational fixtures.`);
      } catch (fixtureErr) {
        console.warn('[Database] Warning: could not parse static_fixtures.json:', fixtureErr.message);
      }
    } else {
      console.log(`[Database] Fresh empty database initialized.`);
    }

    // Persist initial runtime file immediately
    saveDb();
    console.log(`[Database] Created fresh runtime database file at ${dbFile}`);
  }
};

/**
 * Save store to disk safely without Windows/OneDrive rename lock collisions.
 */
export const saveDb = () => {
  const dbFile = getDbFilePath();
  ensureDataDirectory(dbFile);

  try {
    fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    try {
      // Fallback with temporary file copy
      const tempFile = `${dbFile}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
      fs.copyFileSync(tempFile, dbFile);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (fallbackErr) {
      console.error('[Database] Critical error saving runtime database:', fallbackErr);
      throw fallbackErr;
    }
  }
};

// Generic CRUD operations
export const db = {
  get: (table, id) => {
    return (store[table] || []).find(item => item.id === id) || null;
  },

  getAll: (table) => {
    return [...(store[table] || [])];
  },

  find: (table, predicate) => {
    return (store[table] || []).filter(predicate);
  },

  findOne: (table, predicate) => {
    return (store[table] || []).find(predicate) || null;
  },

  insert: (table, item) => {
    if (!store[table]) store[table] = [];
    store[table].push(item);
    saveDb();
    return item;
  },

  insertMany: (table, items) => {
    if (!store[table]) store[table] = [];
    store[table].push(...items);
    saveDb();
    return items;
  },

  update: (table, id, updates) => {
    if (!store[table]) return null;
    const index = store[table].findIndex(item => item.id === id);
    if (index === -1) return null;
    store[table][index] = { ...store[table][index], ...updates, updated_at: new Date().toISOString() };
    saveDb();
    return store[table][index];
  },

  delete: (table, id) => {
    if (!store[table]) return false;
    const initialLen = store[table].length;
    store[table] = store[table].filter(item => item.id !== id);
    if (store[table].length !== initialLen) {
      saveDb();
      return true;
    }
    return false;
  },

  // Raw store accessor for complex aggregations and joins
  getStore: () => store,
  setStore: (newStore) => {
    store = newStore;
    saveDb();
  }
};

export default db;
