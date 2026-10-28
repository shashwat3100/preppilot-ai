import { initDb, db } from '../src/database/db.js';

async function examineIssues() {
  await initDb();

  const ids = [
    'q-tcs-cs-4',
    'q-quant-012',
    'q-logic-044',
    'q-logic-085',
    'q-verbal-059',
    'q-amz-003',
    'q-cap-007',
    'q-os-14'
  ];

  for (const id of ids) {
    const q = db.get('questions', id);
    const options = db.find('questionOptions', o => o.question_id === id);
    console.log('==================================================================');
    console.log(`ID: ${id}`);
    console.log(`Question: ${q.question}`);
    console.log(`Stored correct_answer: ${q.correct_answer}`);
    console.log('Options:');
    options.forEach(o => {
      console.log(`   [${o.option_key}] ${o.option_text} ${o.option_key === q.correct_answer ? '<-- CURRENT STORED CORRECT' : ''}`);
    });
    console.log(`Explanation: ${q.explanation}`);
  }
}

examineIssues();
