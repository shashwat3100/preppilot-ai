import { initDb, db } from '../src/database/db.js';

async function checkUser() {
  await initDb();
  const u = db.get('users', 'user-013e20ae-b037-4c3e-98eb-fccd3449bef1');
  console.log('User 013e:', u);
  
  const attempts = db.find('attempts', a => a.user_id === 'user-013e20ae-b037-4c3e-98eb-fccd3449bef1');
  console.log('Attempts by user 013e:', attempts.length);
  for (const a of attempts) {
    const q = db.get('questions', a.question_id);
    console.log(`- Q: ${q?.question} | Chosen: ${a.user_answer} | Correct: ${q?.correct_answer} | isCorrect: ${a.is_correct}`);
  }
}

checkUser();
