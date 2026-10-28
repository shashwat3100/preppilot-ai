import { initDb, db } from '../src/database/db.js';

async function checkRecentAttempts() {
  await initDb();

  const attempts = db.getAll('attempts') || [];
  const sessions = db.getAll('quizSessions') || [];
  const questions = db.getAll('questions') || [];
  const options = db.getAll('questionOptions') || [];
  const users = db.getAll('users') || [];

  console.log(`Total attempts recorded: ${attempts.length}`);
  console.log(`Total quiz sessions: ${sessions.length}`);

  // Sort attempts by attempted_at or created_at descending
  const recentAttempts = [...attempts].sort((a, b) => {
    const timeA = new Date(a.attempted_at || a.created_at || 0).getTime();
    const timeB = new Date(b.attempted_at || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  console.log('\n--- 20 Most Recent Attempts ---');
  for (const att of recentAttempts.slice(0, 20)) {
    const q = questions.find(item => item.id === att.question_id) || {};
    const qOpts = options.filter(o => o.question_id === q.id);
    const chosenOpt = qOpts.find(o => (o.option_key || '').toUpperCase() === (att.user_answer || '').toUpperCase());
    const correctOpt = qOpts.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
    const user = users.find(u => u.id === att.user_id) || {};

    console.log({
      attempt_id: att.id,
      session_id: att.session_id,
      user: `${user.name} (${user.email})`,
      time: att.attempted_at || att.created_at,
      question_id: att.question_id,
      question: q.question,
      user_answer: att.user_answer,
      user_text: chosenOpt?.option_text || 'UNKNOWN',
      correct_answer: q.correct_answer,
      correct_text: correctOpt?.option_text || 'UNKNOWN',
      is_correct: att.is_correct,
      explanation: q.explanation?.substring(0, 100)
    });
  }
}

checkRecentAttempts().catch(console.error);
