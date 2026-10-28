import { initDb, db } from '../src/database/db.js';

async function checkDistinctKeys() {
  await initDb();
  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];

  const correctAnswers = new Set(questions.map(q => q.correct_answer));
  const optionKeys = new Set(options.map(o => o.option_key));

  console.log('Distinct question.correct_answer values:', Array.from(correctAnswers));
  console.log('Distinct option.option_key values:', Array.from(optionKeys));
}

checkDistinctKeys();
