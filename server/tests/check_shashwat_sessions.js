import { initDb, db } from '../src/database/db.js';

async function checkShashwatSessions() {
  await initDb();
  const sessions = db.find('quizSessions', s => s.user_id === 'user-013e20ae-b037-4c3e-98eb-fccd3449bef1');
  console.log(`Shashwat quizSessions count: ${sessions.length}`);
  for (const s of sessions) {
    console.log(`Session: ${s.id} | Mode: ${s.mode} | Status: ${s.status} | Score: ${s.score}% | Created: ${s.created_at}`);
    const qqs = db.find('quizQuestions', qq => qq.session_id === s.id);
    for (const qq of qqs) {
      console.log(`   Q: ${qq.question_id} | UserAnswer: ${qq.user_answer} | isCorrect: ${qq.is_correct}`);
    }
  }
}

checkShashwatSessions();
