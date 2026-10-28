import { initDb, db } from '../src/database/db.js';

async function checkRealUserAttempts() {
  await initDb();

  const attempts = db.getAll('attempts') || [];
  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];
  const users = db.getAll('users') || [];

  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`User: ${u.id} | ${u.email} | ${u.name} | Role: ${u.role}`);
  }

  // Filter out attempts created by test scripts (e.g. within the last few minutes or with dummy answers)
  for (const att of attempts) {
    const u = users.find(user => user.id === att.user_id);
    const q = questions.find(item => item.id === att.question_id);
    const qOpts = options.filter(o => o.question_id === att.question_id);
    const chosenOpt = qOpts.find(o => o.option_key === att.user_answer);
    const correctOpt = qOpts.find(o => o.option_key === q?.correct_answer);

    console.log('----------------------------------------------------');
    console.log(`User: ${u?.email || att.user_id} | Session: ${att.session_id}`);
    console.log(`Q ID: ${att.question_id} | Correct: ${att.is_correct}`);
    console.log(`Q: ${q?.question}`);
    console.log(`User Answer: [${att.user_answer}] "${chosenOpt?.option_text}"`);
    console.log(`Correct Answer: [${q?.correct_answer}] "${correctOpt?.option_text}"`);
    console.log(`Explanation: ${q?.explanation}`);
  }
}

checkRealUserAttempts();
