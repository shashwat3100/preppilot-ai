import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb } from '../src/database/db.js';
import { generateProgrammingBank } from './data/programmingBank.js';
import { generateGoogleQuestions } from './data/companyGoogleData.js';
import { generateMicrosoftQuestions } from './data/companyMicrosoftData.js';
import { generateAmazonQuestions } from './data/companyAmazonData.js';
import { generateCapgeminiQuestions } from './data/companyCapgeminiData.js';
import { generateDeloitteQuestions } from './data/companyDeloitteData.js';
import { generateServiceCompanyQuestions } from './data/companyServiceData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

export async function runProgrammingAndCompanySeed() {
  await initDb();
  console.log('[Seed] Initializing database for Programming & Company Questions...');

  const programmingQuestions = generateProgrammingBank().map((q, idx) => ({
    ...q,
    branch_id: q.branch_id || 'branch-cse',
    job_role_id: q.job_role_id || 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: q.expected_time || 50,
    xp_value: q.xp_value || 25
  }));

  const googleQuestions = generateGoogleQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-cse',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 60,
    xp_value: 30
  }));

  const msftQuestions = generateMicrosoftQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-cse',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 55,
    xp_value: 25
  }));

  const amzQuestions = generateAmazonQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-cse',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 55,
    xp_value: 30
  }));

  const capQuestions = generateCapgeminiQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-it',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 45,
    xp_value: 20
  }));

  const delQuestions = generateDeloitteQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-it',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 45,
    xp_value: 20
  }));

  const serviceQuestions = generateServiceCompanyQuestions().map((q, idx) => ({
    ...q,
    branch_id: 'branch-cse',
    job_role_id: 'role-sde',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 45,
    xp_value: 20
  }));

  const allNewQuestionSets = [
    { label: 'Core Programming (DSA, OOP, System)', items: programmingQuestions },
    { label: 'Google Interview Bank', items: googleQuestions },
    { label: 'Microsoft Interview Bank', items: msftQuestions },
    { label: 'Amazon Interview Bank', items: amzQuestions },
    { label: 'Capgemini Interview Bank', items: capQuestions },
    { label: 'Deloitte Interview Bank', items: delQuestions },
    { label: 'Service Companies Supplementary (Wipro, Accenture, Cognizant)', items: serviceQuestions }
  ];

  // 1. Verify Uniqueness of IDs and Text
  const seenIds = new Set();
  const seenTexts = new Set();

  for (const set of allNewQuestionSets) {
    for (const q of set.items) {
      if (seenIds.has(q.id)) {
        throw new Error(`Duplicate question ID detected: ${q.id} in set: ${set.label}`);
      }
      seenIds.add(q.id);

      const normText = q.question.trim().toLowerCase();
      if (seenTexts.has(normText)) {
        console.warn(`[Seed Warning] Similar question text detected: "${q.question.slice(0, 60)}..."`);
      }
      seenTexts.add(normText);
    }
  }

  console.log(`[Seed] Verified ${seenIds.size} total new unique questions across all banks.`);

  // 2. Insert into SQLite Database
  let totalInserted = 0;
  let totalOptionsInserted = 0;

  for (const set of allNewQuestionSets) {
    console.log(`[Seed] Ingesting ${set.label} (${set.items.length} questions)...`);

    for (const q of set.items) {
      const { options, ...qFields } = q;
      const existing = db.get('questions', qFields.id);

      if (!existing) {
        db.insert('questions', qFields);
        totalInserted++;
      } else {
        db.update('questions', qFields.id, { ...existing, ...qFields });
      }

      for (const opt of options) {
        const optKey = opt.key || opt.option_key;
        const optText = opt.text || opt.option_text;
        const optId = `opt-${qFields.id}-${optKey}`;
        const existingOpt = db.get('questionOptions', optId);
        const optData = {
          id: optId,
          question_id: qFields.id,
          option_key: optKey,
          option_text: optText,
          is_correct: opt.is_correct || optKey === qFields.correct_answer,
          explanation: opt.explanation || (optKey === qFields.correct_answer ? 'Correct answer.' : '')
        };

        if (!existingOpt) {
          db.insert('questionOptions', optData);
          totalOptionsInserted++;
        } else {
          db.update('questionOptions', optId, { ...existingOpt, ...optData });
        }
      }
    }
  }

  saveDb();
  console.log(`[Seed] Successfully populated ${totalInserted} questions and ${totalOptionsInserted} options into SQLite database.`);

  // 3. Update master static_fixtures.json
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
      const fixtures = JSON.parse(raw);

      fixtures.questions = fixtures.questions || [];
      fixtures.questionOptions = fixtures.questionOptions || [];

      for (const set of allNewQuestionSets) {
        for (const q of set.items) {
          const { options, ...qFields } = q;
          const qIdx = fixtures.questions.findIndex(item => item.id === qFields.id);
          if (qIdx === -1) {
            fixtures.questions.push(qFields);
          } else {
            fixtures.questions[qIdx] = { ...fixtures.questions[qIdx], ...qFields };
          }

          for (const opt of options) {
            const optKey = opt.key || opt.option_key;
            const optText = opt.text || opt.option_text;
            const optId = `opt-${qFields.id}-${optKey}`;
            const optIdx = fixtures.questionOptions.findIndex(item => item.id === optId);
            const optPayload = {
              id: optId,
              question_id: qFields.id,
              option_key: optKey,
              option_text: optText,
              is_correct: opt.is_correct || optKey === qFields.correct_answer,
              explanation: opt.explanation || ''
            };

            if (optIdx === -1) {
              fixtures.questionOptions.push(optPayload);
            } else {
              fixtures.questionOptions[optIdx] = { ...fixtures.questionOptions[optIdx], ...optPayload };
            }
          }
        }
      }

      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(fixtures, null, 2), 'utf-8');
      console.log(`[Seed] static_fixtures.json updated successfully with all questions.`);
    } catch (err) {
      console.error('[Seed] Error updating static_fixtures.json:', err.message);
    }
  }

  // 4. Verification Check
  const allQuestions = db.find('questions', () => true);
  console.log(`\n==================================================`);
  console.log(`📊 TOTAL QUESTIONS IN DATABASE: ${allQuestions.length}`);
  console.log(`==================================================`);

  const programmingCount = allQuestions.filter(q => q.subject_id === 'sub-dsa' || q.subject_id === 'sub-oop').length;
  console.log(`💻 Total Programming Questions (DSA + OOP): ${programmingCount}`);

  const companies = db.find('companies', () => true);
  console.log(`\n🏢 COMPANY QUESTION AUDIT:`);
  let allCompaniesPass = true;

  for (const c of companies) {
    const cQuestions = allQuestions.filter(q => q.company_id === c.id);
    const pass = cQuestions.length >= 100;
    if (!pass) allCompaniesPass = false;
    const status = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`  - [${c.id}] ${c.name.padEnd(12)}: ${String(cQuestions.length).padStart(3)} questions ${status} (>= 100 target)`);
  }

  console.log(`\nVerification Status: ${allCompaniesPass ? '🎉 ALL COMPANIES HAVE 100+ QUESTIONS' : '⚠️ Some companies under target'}`);
}

// Auto-run if executed directly via node
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  runProgrammingAndCompanySeed().then(() => {
    console.log('Seed completed successfully.');
    process.exit(0);
  }).catch(err => {
    console.error('Seed execution error:', err);
    process.exit(1);
  });
}
