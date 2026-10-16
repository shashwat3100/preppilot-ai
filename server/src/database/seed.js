import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db, { initDb, saveDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, 'static_fixtures.json');

/**
 * Seeds static educational content and, in controlled development environments,
 * local testing demo accounts. Production startup strictly skips demo account generation.
 *
 * @param {boolean} force - Force re-seeding of static fixtures
 */
export const seedDatabase = async (force = false) => {
  await initDb();

  // 1. Populate static educational content from trusted fixtures if empty or forced
  const existingQuestions = db.getAll('questions');
  if (existingQuestions.length === 0 || force) {
    if (fs.existsSync(FIXTURES_FILE)) {
      try {
        const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
        const fixtures = JSON.parse(raw);
        const store = db.getStore();

        for (const [table, items] of Object.entries(fixtures)) {
          if (Array.isArray(items) && items.length > 0) {
            if ((store[table] || []).length === 0 || force) {
              store[table] = [...items];
            }
          }
        }
        saveDb();
        console.log('[Seed] Static educational fixtures populated successfully.');
      } catch (err) {
        console.error('[Seed] Error reading static educational fixtures:', err.message);
      }
    } else {
      console.warn('[Seed] Warning: static_fixtures.json not found at', FIXTURES_FILE);
    }
  }

  // 2. Production Environment Check:
  // Strictly prevent creation of shared demo accounts or performance histories in production
  const isProd = process.env.NODE_ENV === 'production';
  const allowDevDemo = process.env.ALLOW_DEV_DEMO_ACCOUNTS === 'true' ||
    (!isProd && (process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV));

  if (!allowDevDemo || isProd) {
    console.log('[Seed] Production or demo-restricted environment. No demo accounts created.');
    return;
  }

  // 3. Development / Test Only: Seed demo accounts if no users exist
  const currentUsers = db.getAll('users');
  if (currentUsers.length > 0 && !force) {
    console.log('[Seed] Development users already present. Skipping demo user seed.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const studentHash1 = await bcrypt.hash('password123', salt);
  const studentHash2 = await bcrypt.hash('password123', salt);
  const adminHash1 = await bcrypt.hash('admin123', salt);
  const adminHash2 = await bcrypt.hash('AdminPass123', salt);
  const deanHash1 = await bcrypt.hash('DeanPass123', salt);

  const demoUsers = [
    {
      id: 'user-student-demo',
      name: 'Aditya Sharma',
      email: 'student@careerprep.ai',
      password_hash: studentHash1,
      role: 'STUDENT',
      branch_id: 'branch-it',
      year: '4th Year',
      graduation_year: 2026,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Intermediate',
      areas_of_interest: ['DBMS', 'DSA', 'Operating Systems', 'System Design'],
      total_xp: 420,
      current_level: 3,
      current_streak: 5,
      longest_streak: 9,
      last_active_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'user-student-college',
      name: 'Student Candidate',
      email: 'student@college.edu',
      password_hash: studentHash2,
      role: 'STUDENT',
      branch_id: 'branch-cse',
      year: '4th Year',
      graduation_year: 2026,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Intermediate',
      areas_of_interest: ['DBMS', 'DSA', 'Operating Systems'],
      total_xp: 420,
      current_level: 3,
      current_streak: 5,
      longest_streak: 9,
      last_active_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'user-admin-demo',
      name: 'Administrator',
      email: 'admin@careerprep.ai',
      password_hash: adminHash1,
      role: 'ADMIN',
      designation: 'Administrator',
      branch_id: 'branch-cse',
      year: 'Faculty / Admin',
      graduation_year: 2020,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives', 'Assessment Evaluation', 'Curriculum Mapping'],
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'user-dean-demo',
      name: 'Dean',
      email: 'dean@college.edu',
      password_hash: deanHash1,
      role: 'DEAN',
      designation: 'Dean',
      branch_id: 'branch-cse',
      year: 'Faculty / Dean',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-amazon'],
      skill_level: 'Advanced',
      areas_of_interest: ['Academic Analytics', 'Student Performance Evaluation', 'Placement Outcomes'],
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'user-admin-college',
      name: 'Dean',
      email: 'admin@college.edu',
      password_hash: adminHash2,
      role: 'DEAN',
      designation: 'Dean',
      branch_id: 'branch-cse',
      year: 'Faculty / Dean',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives'],
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_active_date: new Date().toISOString().split('T')[0]
    }
  ];

  const studentPerformance = [
    {
      id: 'perf-1',
      user_id: 'user-student-demo',
      topic_id: 'top-normalization',
      subject_id: 'sub-dbms',
      attempts_count: 5,
      correct_count: 2,
      accuracy_rate: 40.0,
      weakness_score: 0.75,
      last_attempted_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-2',
      user_id: 'user-student-demo',
      topic_id: 'top-trees',
      subject_id: 'sub-dsa',
      attempts_count: 6,
      correct_count: 5,
      accuracy_rate: 83.3,
      weakness_score: 0.18,
      last_attempted_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-3',
      user_id: 'user-student-demo',
      topic_id: 'top-deadlocks',
      subject_id: 'sub-os',
      attempts_count: 4,
      correct_count: 2,
      accuracy_rate: 50.0,
      weakness_score: 0.60,
      last_attempted_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 'perf-4',
      user_id: 'user-student-demo',
      topic_id: 'top-osi-tcp',
      subject_id: 'sub-cn',
      attempts_count: 4,
      correct_count: 4,
      accuracy_rate: 100.0,
      weakness_score: 0.05,
      last_attempted_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
    }
  ];

  const xpHistory = [
    { id: 'xp-1', user_id: 'user-student-demo', amount: 100, action_type: 'DAILY_STREAK_BONUS', created_at: new Date().toISOString() },
    { id: 'xp-2', user_id: 'user-student-demo', amount: 320, action_type: 'ADAPTIVE_QUIZ_COMPLETED', created_at: new Date().toISOString() }
  ];

  const streaks = [
    {
      id: 'streak-1',
      user_id: 'user-student-demo',
      current_streak: 5,
      longest_streak: 9,
      last_activity_date: new Date().toISOString().split('T')[0],
      streak_freeze_count: 2
    }
  ];

  const store = db.getStore();
  store.users = demoUsers;
  store.studentPerformance = studentPerformance;
  store.xpHistory = xpHistory;
  store.streaks = streaks;
  saveDb();
  console.log('[Seed] Dev demo accounts initialized successfully.');
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase(true).then(() => {
    console.log('[Seed] Execution finished.');
    process.exit(0);
  });
}
