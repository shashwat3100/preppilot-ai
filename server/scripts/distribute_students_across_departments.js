import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb } from '../src/database/db.js';
import { generateMigration } from '../src/database/migrateToPostgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

const DEPARTMENT_DISTRIBUTION = [
  // 1..20 (20 students) -> CSE
  ...Array.from({ length: 20 }, (_, i) => ({ index: i + 1, branchId: 'branch-cse' })),
  // 21..34 (14 students) -> IT
  ...Array.from({ length: 14 }, (_, i) => ({ index: i + 21, branchId: 'branch-it' })),
  // 35..46 (12 students) -> AIDS
  ...Array.from({ length: 12 }, (_, i) => ({ index: i + 35, branchId: 'branch-aids' })),
  // 47..56 (10 students) -> AIML
  ...Array.from({ length: 10 }, (_, i) => ({ index: i + 47, branchId: 'branch-aiml' })),
  // 57..66 (10 students) -> ECE
  ...Array.from({ length: 10 }, (_, i) => ({ index: i + 57, branchId: 'branch-ece' })),
  // 67..72 (6 students) -> EE
  ...Array.from({ length: 6 }, (_, i) => ({ index: i + 67, branchId: 'branch-ee' })),
  // 73..77 (5 students) -> ME
  ...Array.from({ length: 5 }, (_, i) => ({ index: i + 73, branchId: 'branch-me' })),
  // 78..80 (3 students) -> CE
  ...Array.from({ length: 3 }, (_, i) => ({ index: i + 78, branchId: 'branch-ce' }))
];

const distributionMap = new Map();
DEPARTMENT_DISTRIBUTION.forEach(d => distributionMap.set(d.index, d.branchId));

async function main() {
  await initDb();
  console.log('[Distribute Departments] Loading users...');

  const allUsers = db.getAll('users');
  const branches = db.getAll('branches');
  const branchesMap = new Map(branches.map(b => [b.id, b.name]));

  let updatedCount = 0;
  const updatedUsers = [];

  for (const user of allUsers) {
    if (!user.email) continue;
    // Match cohort emails: e.g. aarav.sharma.1@college.edu or similar with .<num>@college.edu
    const match = user.email.match(/\.(\d+)@college\.edu$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      const targetBranchId = distributionMap.get(idx);
      if (targetBranchId && user.branch_id !== targetBranchId) {
        user.branch_id = targetBranchId;
        user.branch = targetBranchId;
        user.branch_name = branchesMap.get(targetBranchId) || targetBranchId;
        db.update('users', user.id, user);
        updatedUsers.push(user);
        updatedCount++;
      }
    }
  }

  saveDb();
  console.log(`[Distribute Departments] Updated ${updatedCount} cohort students across engineering departments.`);

  // Update static_fixtures.json
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const fixtures = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8'));
      if (Array.isArray(fixtures.users)) {
        for (const u of fixtures.users) {
          const match = u.email && u.email.match(/\.(\d+)@college\.edu$/);
          if (match) {
            const idx = parseInt(match[1], 10);
            const targetBranchId = distributionMap.get(idx);
            if (targetBranchId) {
              u.branch_id = targetBranchId;
              u.branch = targetBranchId;
              u.branch_name = branchesMap.get(targetBranchId) || targetBranchId;
            }
          }
        }
        fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
        console.log('[Distribute Departments] Updated static_fixtures.json successfully.');
      }
    } catch (err) {
      console.warn('[Distribute Departments] Could not update static_fixtures.json:', err.message);
    }
  }

  // Update Postgres if configured
  if (process.env.DATABASE_URL && updatedUsers.length > 0) {
    console.log('[Distribute Departments] Syncing updated student branches to Neon PostgreSQL...');
    try {
      await generateMigration(true);
      console.log('[Distribute Departments] Successfully migrated records to Neon PostgreSQL.');
    } catch (err) {
      console.warn('[Distribute Departments] PostgreSQL sync warning:', err.message);
    }
  }

  // Report final tally
  const refreshedUsers = db.getAll('users').filter(u => u.role === 'STUDENT');
  const tally = {};
  for (const u of refreshedUsers) {
    const bName = branchesMap.get(u.branch_id) || u.branch_id || 'Unknown';
    tally[bName] = (tally[bName] || 0) + 1;
  }
  console.log('\n--- Final Student Distribution by Department ---');
  console.table(tally);
}

main().catch(console.error);
