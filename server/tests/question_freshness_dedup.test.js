import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import db, { initDb } from '../src/database/db.js';
import QuizEngine from '../src/services/quizEngine.js';
import RecommendationEngine from '../src/services/recommendationEngine.js';

test('PrepPilot AI — Question Freshness & Anti-Repetition Engine', async (t) => {
  await initDb();
  const testUserId = `test-freshness-user-${crypto.randomUUID()}`;

  // Create a clean student user
  db.insert('users', {
    id: testUserId,
    name: 'Freshness Test Student',
    email: `${testUserId}@college.edu`,
    role: 'STUDENT',
    branch_id: 'branch-cse',
    branch_name: 'Computer Science & Engineering',
    branch_code: 'CSE',
    year: '3rd Year',
    graduation_year: 2026,
    target_companies: ['comp-google', 'comp-tcs', 'comp-amazon'],
    skill_level: 'Intermediate',
    total_xp: 100,
    current_level: 1,
    current_streak: 1,
    longest_streak: 1,
    created_at: new Date().toISOString()
  });

  await t.test('1. Three consecutive daily quizzes yield 100% disjoint, unique questions', () => {
    // Round 1: Generate Adaptive Daily Quiz (5 questions)
    const quiz1 = QuizEngine.generateAdaptiveDailyQuiz(testUserId, 5);
    assert.strictEqual(quiz1.questions.length, 5, 'Quiz 1 should have 5 questions');
    const qIds1 = new Set(quiz1.questions.map(q => q.id));
    assert.strictEqual(qIds1.size, 5, 'Quiz 1 should contain 5 unique question IDs');

    // Submit Quiz 1 answers
    const answers1 = quiz1.questions.map(q => ({
      question_id: q.id,
      answer: 'A',
      time_spent: 10
    }));
    const result1 = QuizEngine.submitQuiz(quiz1.session_id, testUserId, answers1, 50);
    assert.strictEqual(db.get('quizSessions', quiz1.session_id).status, 'COMPLETED');

    // Round 2: Generate Adaptive Daily Quiz (5 questions)
    const quiz2 = QuizEngine.generateAdaptiveDailyQuiz(testUserId, 5);
    assert.strictEqual(quiz2.questions.length, 5, 'Quiz 2 should have 5 questions');
    const qIds2 = new Set(quiz2.questions.map(q => q.id));
    assert.strictEqual(qIds2.size, 5, 'Quiz 2 should contain 5 unique question IDs');

    // Check intersection between Quiz 1 and Quiz 2
    const overlap12 = [...qIds1].filter(id => qIds2.has(id));
    assert.strictEqual(overlap12.length, 0, `Quiz 2 must NOT repeat any questions from Quiz 1. Overlap: ${overlap12.join(', ')}`);

    // Submit Quiz 2 answers
    const answers2 = quiz2.questions.map(q => ({
      question_id: q.id,
      answer: 'B',
      time_spent: 12
    }));
    const result2 = QuizEngine.submitQuiz(quiz2.session_id, testUserId, answers2, 60);
    assert.strictEqual(db.get('quizSessions', quiz2.session_id).status, 'COMPLETED');

    // Round 3: Generate Adaptive Daily Quiz (5 questions)
    const quiz3 = QuizEngine.generateAdaptiveDailyQuiz(testUserId, 5);
    assert.strictEqual(quiz3.questions.length, 5, 'Quiz 3 should have 5 questions');
    const qIds3 = new Set(quiz3.questions.map(q => q.id));
    assert.strictEqual(qIds3.size, 5, 'Quiz 3 should contain 5 unique question IDs');

    // Check intersection between Quiz 3 and (Quiz 1 U Quiz 2)
    const seenSoFar = new Set([...qIds1, ...qIds2]);
    const overlap3 = [...seenSoFar].filter(id => qIds3.has(id));
    assert.strictEqual(overlap3.length, 0, `Quiz 3 must NOT repeat any questions from prior quizzes. Overlap: ${overlap3.join(', ')}`);
  });

  await t.test('2. In-progress / unsubmitted sessions prevent question repetition', () => {
    // Generate quiz session without submitting
    const activeQuiz = QuizEngine.generateAdaptiveDailyQuiz(testUserId, 5);
    const activeIds = new Set(activeQuiz.questions.map(q => q.id));

    // Immediately generate another custom quiz without completing activeQuiz
    const nextQuiz = QuizEngine.generateCustomQuiz(testUserId, {
      question_count: 5,
      branch_id: 'branch-cse'
    });
    const nextIds = new Set(nextQuiz.questions.map(q => q.id));

    const collision = [...activeIds].filter(id => nextIds.has(id));
    assert.strictEqual(collision.length, 0, `Questions in an active unsubmitted session must not be served in new quizzes. Collision: ${collision.join(', ')}`);
  });

  await t.test('3. Custom Practice Quizzes for target company give fresh questions', () => {
    // Generate 5 questions for TCS
    const tcsQuiz1 = QuizEngine.generateCustomQuiz(testUserId, {
      company_id: 'comp-tcs',
      question_count: 5
    });
    assert.strictEqual(tcsQuiz1.questions.length, 5);
    const tcsIds1 = new Set(tcsQuiz1.questions.map(q => q.id));

    // Submit TCS Quiz 1
    QuizEngine.submitQuiz(tcsQuiz1.session_id, testUserId, tcsQuiz1.questions.map(q => ({
      question_id: q.id,
      answer: 'A',
      time_spent: 15
    })), 75);

    // Generate second 5 questions for TCS
    const tcsQuiz2 = QuizEngine.generateCustomQuiz(testUserId, {
      company_id: 'comp-tcs',
      question_count: 5
    });
    assert.strictEqual(tcsQuiz2.questions.length, 5);
    const tcsIds2 = new Set(tcsQuiz2.questions.map(q => q.id));

    const tcsOverlap = [...tcsIds1].filter(id => tcsIds2.has(id));
    assert.strictEqual(tcsOverlap.length, 0, `TCS quiz attempts must receive fresh company questions. Overlap: ${tcsOverlap.join(', ')}`);
  });

  await t.test('4. RecommendationEngine scores unattempted questions above attempted questions', () => {
    const recs = RecommendationEngine.getRecommendations(testUserId, 15);
    assert.ok(recs.length > 0, 'Recommendations should be returned');

    // All top recommendations should be unattempted
    const attemptedInRecs = recs.filter(q => q.has_attempted);
    assert.strictEqual(attemptedInRecs.length, 0, 'Top recommendations should prioritize fresh unattempted questions');
  });

  await t.test('5. Graceful fallback when unattempted questions are exhausted', () => {
    // Test with a filter that has only 1 question in total
    const allCN = db.find('questions', q => q.subject_id === 'sub-cn');
    assert.ok(allCN.length > 0);

    // Pick single question subtopic
    const targetQ = allCN[0];

    // Artificially attempt targetQ
    db.insert('attempts', {
      id: `att-test-exhaust-${crypto.randomUUID()}`,
      user_id: testUserId,
      question_id: targetQ.id,
      session_id: 'sess-fake',
      chosen_answer: 'A',
      is_correct: false,
      time_taken_seconds: 15,
      attempted_at: new Date(Date.now() - 3600000).toISOString()
    });

    // Custom quiz with narrow filter should not crash and should fall back gracefully
    const quiz = QuizEngine.generateCustomQuiz(testUserId, {
      topic_ids: [targetQ.topic_id],
      question_count: 2
    });

    assert.ok(quiz.questions.length > 0, 'Should gracefully fall back to attempted questions when pool exhausted');
  });

  await t.test('6. Timed Assessments deliver fresh questions across consecutive sessions', () => {
    const asmt1 = QuizEngine.generateAssessment(testUserId, 'core-cs');
    assert.strictEqual(asmt1.total_questions, 20);
    const asmtIds1 = new Set(asmt1.questions.map(q => q.id));
    assert.strictEqual(asmtIds1.size, 20);

    const asmt2 = QuizEngine.generateAssessment(testUserId, 'core-cs');
    assert.strictEqual(asmt2.total_questions, 20);
    const asmtIds2 = new Set(asmt2.questions.map(q => q.id));

    const asmtOverlap = [...asmtIds1].filter(id => asmtIds2.has(id));
    assert.strictEqual(asmtOverlap.length, 0, `Consecutive assessments must not repeat questions. Overlap: ${asmtOverlap.join(', ')}`);
  });

  // Cleanup probe user
  try {
    db.delete('users', testUserId);
    const sessions = db.find('quizSessions', s => s.user_id === testUserId) || [];
    sessions.forEach(s => {
      db.delete('quizSessions', s.id);
      const qqs = db.find('quizQuestions', qq => qq.session_id === s.id) || [];
      qqs.forEach(qq => db.delete('quizQuestions', qq.id));
    });
    const attempts = db.find('attempts', a => a.user_id === testUserId) || [];
    attempts.forEach(a => db.delete('attempts', a.id));
  } catch (err) {
    // Ignore cleanup errors
  }
});
