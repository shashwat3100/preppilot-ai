import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { db, initDb, saveDb } from '../src/database/db.js';
import { STARTER_TEMPLATES } from '../src/database/codingStarterTemplates.js';

export { STARTER_TEMPLATES };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '../src/database/static_fixtures.json');

export async function applyTemplates() {
  console.log('[1/4] Updating static_fixtures.json...');
  const fixturesRaw = fs.readFileSync(fixturesPath, 'utf-8');
  const fixtures = JSON.parse(fixturesRaw);

  if (Array.isArray(fixtures.codingProblems)) {
    for (const prob of fixtures.codingProblems) {
      if (STARTER_TEMPLATES[prob.id]) {
        prob.starterCode = STARTER_TEMPLATES[prob.id];
      }
    }
  }
  fs.writeFileSync(fixturesPath, JSON.stringify(fixtures, null, 2), 'utf-8');
  console.log('✓ static_fixtures.json updated successfully.');

  console.log('[2/4] Updating local SQLite DB...');
  await initDb();
  for (const [probId, starter] of Object.entries(STARTER_TEMPLATES)) {
    const existing = db.get('codingProblems', probId);
    if (existing) {
      existing.starterCode = starter;
      db.update('codingProblems', probId, existing);
    }
  }
  saveDb();
  console.log('✓ Local SQLite DB updated.');

  console.log('[3/4] Updating Neon PostgreSQL...');
  const pgUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ZrdW6cUlhE1F@ep-dark-mountain-b4w8hfn7-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
  const pool = new pg.Pool({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });

  try {
    for (const [probId, starter] of Object.entries(STARTER_TEMPLATES)) {
      await pool.query('UPDATE coding_problems SET starter_code = $1 WHERE id = $2', [JSON.stringify(starter), probId]);
    }
    console.log('✓ Neon PostgreSQL coding_problems table updated with student starter templates.');
  } catch (err) {
    console.warn('[Postgres warning]:', err.message);
  } finally {
    await pool.end();
  }

  console.log('[4/4] Completed all updates successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('apply_student_starter_templates.js')) {
  applyTemplates().catch(console.error);
}
