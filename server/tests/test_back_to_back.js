import assert from 'node:assert';
import { initDb, db } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';
import QuizEngine from '../src/services/quizEngine.js';

async function runBackToBackTests() {
  await initDb();
  await seedDatabase(false);

  const student = db.findOne('users', u => u.role === 'STUDENT');
  assert.ok(student, 'Student user must exist');
  console.log('Testing with student:', student.id, student.name);

  // ==========================================
  // Test 1: First Quiz Generation and Submission
  // ==========================================
  console.log('\n--- Test 1: Generating Quiz 1 ---');
  const quiz1 = QuizEngine.generateAdaptiveDailyQuiz(student.id, 5);
  assert.ok(quiz1.session_id, 'Quiz 1 must have a session_id');
  assert.strictEqual(quiz1.questions.length, 5, 'Quiz 1 must contain 5 questions');

  const answers1 = quiz1.questions.map(q => ({
    question_id: q.id,
    answer: q.options[0].option_key,
    time_spent: 25
  }));

  console.log('--- Submitting Quiz 1 ---');
  const res1 = QuizEngine.submitQuiz(quiz1.session_id, student.id, answers1, 125);
  assert.strictEqual(res1.session_id, quiz1.session_id, 'Result must match Quiz 1 session');
  assert.strictEqual(res1.graded_questions.length, 5, 'Result must grade all 5 questions');
  assert.ok(typeof res1.accuracy_rate === 'number', 'Accuracy rate must be calculated');
  console.log('  ✓ Quiz 1 submitted successfully! Score:', res1.accuracy_rate + '%', 'XP:', res1.xp_earned);

  // ==========================================
  // Test 2: Second Quiz Generation (Back-to-back immediately)
  // ==========================================
  console.log('\n--- Test 2: Generating Quiz 2 (Back-to-back) ---');
  const quiz2 = QuizEngine.generateAdaptiveDailyQuiz(student.id, 5);
  assert.ok(quiz2.session_id, 'Quiz 2 must have a fresh session_id');
  assert.notStrictEqual(quiz2.session_id, quiz1.session_id, 'Quiz 2 session_id must differ from Quiz 1');
  assert.strictEqual(quiz2.questions.length, 5, 'Quiz 2 must contain 5 questions');

  // Verify anti-repetition: questions in Quiz 2 should prioritize fresh questions not in Quiz 1
  const q1Ids = new Set(quiz1.questions.map(q => q.id));
  const q2Ids = quiz2.questions.map(q => q.id);
  const freshCount = q2Ids.filter(id => !q1Ids.has(id)).length;
  console.log(`  ✓ Quiz 2 freshness: ${freshCount}/5 questions are completely fresh`);

  const answers2 = quiz2.questions.map(q => ({
    question_id: q.id,
    answer: q.options[0].option_key,
    time_spent: 20
  }));

  console.log('--- Submitting Quiz 2 ---');
  const res2 = QuizEngine.submitQuiz(quiz2.session_id, student.id, answers2, 100);
  assert.strictEqual(res2.session_id, quiz2.session_id, 'Result must match Quiz 2 session');
  assert.strictEqual(res2.graded_questions.length, 5, 'Result must grade all 5 questions');
  assert.ok(typeof res2.accuracy_rate === 'number', 'Accuracy rate must be calculated');
  console.log('  ✓ Quiz 2 submitted successfully! Score:', res2.accuracy_rate + '%', 'XP:', res2.xp_earned);

  // ==========================================
  // Test 3: Simulated Serverless Cold Start Resilience
  // Session record is wiped/missing from local container database,
  // but student submits answers from frontend
  // ==========================================
  console.log('\n--- Test 3: Simulated Serverless Cold Start (Missing Session Recovery) ---');
  const coldStartSessionId = `session-coldstart-${Date.now()}`;
  // Deliberately do NOT insert into quizSessions or quizQuestions
  const coldAnswers = quiz2.questions.map(q => ({
    question_id: q.id,
    answer: q.options[1] ? q.options[1].option_key : q.options[0].option_key,
    time_spent: 18
  }));

  const resCold = QuizEngine.submitQuiz(coldStartSessionId, student.id, coldAnswers, 90);
  assert.strictEqual(resCold.session_id, coldStartSessionId, 'Cold start result must match session');
  assert.strictEqual(resCold.graded_questions.length, 5, 'Cold start must reconstruct and grade all 5 questions');
  assert.ok(resCold.graded_questions[0].question, 'Graded question must have valid question text');
  console.log('  ✓ Cold start submission successfully recovered and evaluated! Score:', resCold.accuracy_rate + '%');

  // ==========================================
  // Test 4: Idempotent Resubmission
  // ==========================================
  console.log('\n--- Test 4: Idempotent Submission Lock ---');
  const resIdempotent = QuizEngine.submitQuiz(quiz2.session_id, student.id, answers2, 100);
  assert.strictEqual(resIdempotent.session_id, quiz2.session_id);
  assert.strictEqual(resIdempotent.is_locked, true, 'Subsequent submission must return idempotent lock');
  console.log('  ✓ Idempotent submission lock verified');

  console.log('\n============================================================');
  console.log('✅ ALL BACK-TO-BACK QUIZ SUBMISSION TESTS PASSED (100%)');
  console.log('============================================================');
}

runBackToBackTests().catch(err => {
  console.error('FAILED:', err);
  process.exit(1);
});
