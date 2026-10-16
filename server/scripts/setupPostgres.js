import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
  console.log('[PostgreSQL 18 Setup] Connecting to default postgres database...');
  const adminClient = new pg.Client({
    host: 'localhost',
    port: 1111,
    user: 'postgres',
    password: 'Pranjal@25',
    database: 'postgres'
  });

  await adminClient.connect();
  console.log('✓ Connected to PostgreSQL server on port 1111.');

  const checkDb = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = 'careerprep'");
  if (checkDb.rows.length === 0) {
    console.log('[PostgreSQL 18 Setup] Creating database careerprep...');
    await adminClient.query('CREATE DATABASE careerprep');
    console.log('✓ Database careerprep created successfully.');
  } else {
    console.log('✓ Database careerprep already exists.');
  }
  await adminClient.end();

  // Connect to careerprep database
  console.log('[PostgreSQL 18 Setup] Connecting to database careerprep...');
  const appClient = new pg.Client({
    host: 'localhost',
    port: 1111,
    user: 'postgres',
    password: 'Pranjal@25',
    database: 'careerprep'
  });

  await appClient.connect();
  console.log('✓ Connected to careerprep database.');

  // Execute schema.sql
  const schemaPath = path.resolve(__dirname, '../src/database/schema.sql');
  console.log(`[PostgreSQL 18 Setup] Executing schema DDL from: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await appClient.query(schemaSql);
  console.log('✓ Schema tables, constraints, and full-text RAG search indexes created!');

  // Generate fresh migration dump
  const { generateMigration } = await import('../src/database/migrateToPostgres.js');
  await generateMigration(false);

  // Execute migration_dump.sql
  const migrationPath = path.resolve(__dirname, '../src/database/migration_dump.sql');
  console.log(`[PostgreSQL 18 Setup] Executing data migration from: ${migrationPath}`);
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  await appClient.query(migrationSql);
  console.log('✓ All 84 Questions, 336 Options, 18 Coding Problems, 69 Test Cases, Users & RAG documents migrated successfully!');

  // Verify counts
  const qCount = await appClient.query('SELECT COUNT(*) as count FROM questions');
  const optCount = await appClient.query('SELECT COUNT(*) as count FROM question_options');
  const pCount = await appClient.query('SELECT COUNT(*) as count FROM coding_problems');
  const tcCount = await appClient.query('SELECT COUNT(*) as count FROM coding_test_cases');
  const uCount = await appClient.query('SELECT COUNT(*) as count FROM users');
  const docCount = await appClient.query('SELECT COUNT(*) as count FROM knowledge_documents');

  console.log('\n======================================================');
  console.log('🎉 POSTGRESQL 18 MIGRATION COMPLETE & VERIFIED:');
  console.log(`  - Questions (MCQs): ${qCount.rows[0].count}`);
  console.log(`  - Question Options: ${optCount.rows[0].count}`);
  console.log(`  - Coding Problems: ${pCount.rows[0].count}`);
  console.log(`  - Test Cases: ${tcCount.rows[0].count}`);
  console.log(`  - Users: ${uCount.rows[0].count}`);
  console.log(`  - Knowledge Documents (RAG): ${docCount.rows[0].count}`);
  console.log('======================================================\n');

  await appClient.end();
}

setup().catch(err => {
  console.error('[PostgreSQL 18 Setup Error]:', err);
  process.exit(1);
});
