import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDb, saveDb } from '../src/database/db.js';
import { generateFullQuantBank } from './data/quantData.js';
import { generateFullLogicBank } from './data/logicData.js';
import { generateFullVerbalBank } from './data/verbalData.js';
import { generateFullDIBank } from './data/diData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_FILE = path.join(__dirname, '../src/database/static_fixtures.json');

const APTITUDE_TOPICS = [
  {
    id: 'top-quant',
    subject_id: 'sub-aptitude',
    name: 'Quantitative Aptitude',
    description: 'Arithmetic, speed math, time & work, percentages, profit & loss, ratios, numbers, probability, and algebra.',
    importance_weight: 1.0
  },
  {
    id: 'top-logic',
    subject_id: 'sub-aptitude',
    name: 'Logical Reasoning',
    description: 'Number/letter series, syllogisms, blood relations, seating arrangements, coding-decoding, clocks, and direction sense.',
    importance_weight: 1.0
  },
  {
    id: 'top-verbal',
    subject_id: 'sub-aptitude',
    name: 'Verbal Ability',
    description: 'Reading comprehension, error spotting, sentence correction, synonyms, antonyms, cloze test, and para-jumbles.',
    importance_weight: 0.95
  },
  {
    id: 'top-di',
    subject_id: 'sub-aptitude',
    name: 'Data Interpretation',
    description: 'Tabular data, bar graphs, pie charts, line graphs, percentage growth analysis, and business caselets.',
    importance_weight: 0.95
  }
];

export async function runFullAptitudeSeed() {
  await initDb();
  console.log('[Full Aptitude Bank Seed] Initializing database...');

  // 1. Ensure topics exist
  for (const topic of APTITUDE_TOPICS) {
    const existing = db.get('topics', topic.id);
    if (!existing) {
      db.insert('topics', topic);
    } else {
      db.update('topics', topic.id, { ...existing, ...topic });
    }
  }

  // 2. Compile full banks for each section
  const quantList = generateFullQuantBank().map((q, idx) => ({
    ...q,
    topic_id: 'top-quant',
    subject_id: 'sub-aptitude',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 45,
    xp_value: 25,
    tags: ['sub-aptitude', 'Quantitative Aptitude', q.subtopic || 'Arithmetic']
  }));

  const logicList = generateFullLogicBank().map((q, idx) => ({
    ...q,
    topic_id: 'top-logic',
    subject_id: 'sub-aptitude',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 45,
    xp_value: 25,
    tags: ['sub-aptitude', 'Logical Reasoning', q.subtopic || 'Puzzles']
  }));

  const verbalList = generateFullVerbalBank().map((q, idx) => ({
    ...q,
    topic_id: 'top-verbal',
    subject_id: 'sub-aptitude',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 35,
    xp_value: 20,
    tags: ['sub-aptitude', 'Verbal Ability', q.subtopic || 'Grammar']
  }));

  const diList = generateFullDIBank().map((q, idx) => ({
    ...q,
    topic_id: 'top-di',
    subject_id: 'sub-aptitude',
    question_type: 'MCQ',
    sequence: idx + 1,
    expected_time: 50,
    xp_value: 25,
    tags: ['sub-aptitude', 'Data Interpretation', q.subtopic || 'Charts']
  }));

  const allSections = [
    { name: 'Quantitative Aptitude', list: quantList },
    { name: 'Logical Reasoning', list: logicList },
    { name: 'Verbal Ability', list: verbalList },
    { name: 'Data Interpretation', list: diList }
  ];

  let totalQuestionsInserted = 0;
  let totalOptionsInserted = 0;

  for (const sec of allSections) {
    console.log(`[Full Aptitude Bank Seed] Seeding section: ${sec.name} (${sec.list.length} questions)...`);

    for (const q of sec.list) {
      const { options, ...questionFields } = q;
      const existing = db.get('questions', questionFields.id);

      if (!existing) {
        db.insert('questions', questionFields);
        totalQuestionsInserted++;
      } else {
        db.update('questions', questionFields.id, { ...existing, ...questionFields });
      }

      for (const opt of options) {
        const optKey = opt.key || opt.option_key;
        const optText = opt.text || opt.option_text;
        const optId = `opt-${questionFields.id}-${optKey}`;
        const existingOpt = db.get('questionOptions', optId);
        const optData = {
          id: optId,
          question_id: questionFields.id,
          option_key: optKey,
          option_text: optText,
          is_correct: opt.is_correct || optKey === questionFields.correct_answer,
          explanation: opt.explanation || (optKey === questionFields.correct_answer ? 'Correct answer.' : 'Incorrect option.')
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
  console.log(`[Full Aptitude Bank Seed] Successfully populated questions and options into SQLite database.`);

  // 3. Update static_fixtures.json
  if (fs.existsSync(FIXTURES_FILE)) {
    try {
      const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
      const fixtures = JSON.parse(raw);

      fixtures.questions = fixtures.questions || [];
      fixtures.questionOptions = fixtures.questionOptions || [];

      for (const sec of allSections) {
        for (const q of sec.list) {
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
      console.log('[Full Aptitude Bank Seed] static_fixtures.json updated successfully.');
    } catch (err) {
      console.error('[Full Aptitude Bank Seed] Failed to update static_fixtures.json:', err.message);
    }
  }

  console.log('==================================================================');
  console.log(`✅ Full Aptitude Bank Seed Complete:`);
  console.log(`- Quantitative Aptitude: ${quantList.length} questions`);
  console.log(`- Logical Reasoning:     ${logicList.length} questions`);
  console.log(`- Verbal Ability:        ${verbalList.length} questions`);
  console.log(`- Data Interpretation:   ${diList.length} questions`);
  console.log(`- Total:                 ${quantList.length + logicList.length + verbalList.length + diList.length} unique questions`);
  console.log('==================================================================');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFullAptitudeSeed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
