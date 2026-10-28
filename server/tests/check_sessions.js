import { initDb, db } from '../src/database/db.js';

async function checkAllSessions() {
  await initDb();
  const sessions = db.getAll('quizSessions') || [];
  console.log('Total sessions:', sessions.length);

  for (const s of sessions.slice(-15)) {
    console.log(`Session: ${s.id} | Mode: ${s.mode} | User: ${s.user_id} | Status: ${s.status} | Score: ${s.score}% | Created: ${s.created_at}`);
    const qqs = db.find('quizQuestions', qq => qq.session_id === s.id) || [];
    for (const qq of qqs) {
      console.log(`   QQ: ${qq.question_id} | UserAnswer: ${qq.user_answer} | isCorrect: ${qq.is_correct}`);
    }
  }
}

checkAllSessions();
