import { initDb, db } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

async function checkOptions() {
  await initDb();
  await seedDatabase(false);

  const questions = db.getAll('questions') || [];
  const allOptions = db.getAll('questionOptions') || [];

  let outOfOrderCount = 0;
  const outOfOrderExamples = [];

  for (const q of questions) {
    const options = allOptions.filter(o => o.question_id === q.id);
    const keys = options.map(o => o.option_key);
    const expected = ['A', 'B', 'C', 'D'].slice(0, keys.length);
    const isSorted = keys.join('') === expected.join('');
    if (!isSorted) {
      outOfOrderCount++;
      outOfOrderExamples.push({ id: q.id, keys, question: q.question.substring(0, 50) });
    }
  }

  console.log(`Total questions: ${questions.length}`);
  console.log(`Questions with out-of-order options: ${outOfOrderCount}`);
  if (outOfOrderExamples.length > 0) {
    console.log('Examples:', outOfOrderExamples.slice(0, 10));
  }
}

checkOptions();
