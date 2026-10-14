import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'careerprep_data.json');

// Memory store backed by persistent JSON file
let store = {
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
};

// Load existing data if available
export const initDb = async () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      store = { ...store, ...JSON.parse(raw) };
      console.log(`[Database] Loaded persistent data from ${DB_FILE}`);
    } else {
      console.log(`[Database] Fresh database initialized. Ready for seeding.`);
    }
  } catch (err) {
    console.error('[Database] Error loading database file:', err);
  }
};

// Save store to disk safely without Windows/OneDrive rename lock collisions
export const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    try {
      // Fallback with copy if write fails
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
      fs.copyFileSync(tempFile, DB_FILE);
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (fallbackErr) {
      console.error('[Database] Error saving database:', fallbackErr);
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
