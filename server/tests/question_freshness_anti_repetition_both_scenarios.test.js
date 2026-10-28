import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import db, { initDb } from '../src/database/db.js';
import QuizEngine from '../src/services/quizEngine.js';
import RecommendationEngine from '../src/services/recommendationEngine.js';
import RagService, { chatServedQuestionTracker } from '../src/services/ragService.js';

test('PrepPilot AI — Zero-Repetition Engine Across Chat and Quizzes (Both Scenarios)', async (t) => {
  await initDb();
  const testStudentId = `test-student-${crypto.randomUUID()}`;

  // Create isolated student
  db.insert('users', {
    id: testStudentId,
    name: 'Anti-Repetition Candidate',
    email: `${testStudentId}@college.edu`,
    role: 'STUDENT',
    branch_id: 'branch-cse',
    branch_name: 'Computer Science & Engineering',
    branch_code: 'CSE',
    year: '3rd Year',
    graduation_year: 2026,
    target_companies: ['comp-google', 'comp-tcs', 'comp-amazon'],
    skill_level: 'Intermediate',
    total_xp: 150,
    current_level: 2,
    current_streak: 3,
    longest_streak: 5,
    created_at: new Date().toISOString()
  });

  const studentProfile = db.get('users', testStudentId);

  await t.test('Scenario 1: AI Assistant Follow-Up Query provides probing dimensions and fresh diverse questions', async () => {
    const res = await RagService.answerStudentQuery('What follow-up interview questions could be asked?', studentProfile);
    assert.ok(res.answer.includes('Follow-Up Questions Framework'), 'Includes follow-up interview probing framework');
    assert.ok(res.answer.includes('Algorithmic Edge Cases & Boundary Probes'), 'Includes edge case dimension');
    assert.ok(res.answer.includes('Space-Time Complexity & Optimization'), 'Includes complexity dimension');
    assert.ok(res.answer.includes('Concurrency, Thread-Safety & Scaling'), 'Includes concurrency dimension');
    assert.ok(res.answer.includes('Failure Recovery & Data Consistency'), 'Includes failure recovery dimension');
    assert.ok(res.answer.includes('Practice Placement Questions'), 'Includes practice placement questions');
    assert.ok(res.speechText.includes('probe edge cases'), 'Spoken audio matches interview follow-up guidance');

    const lines = res.answer.split('\n').filter(l => l.startsWith('#### Question'));
    assert.strictEqual(lines.length, 5, 'Delivers exactly 5 questions');

    // Verify questions are from distinct subjects, not all DBMS
    const subjectMatches = res.answer.match(/#### Question \d+ \(([^|]+) \|/g) || [];
    const subjects = new Set(subjectMatches.map(m => m.replace(/#### Question \d+ \(|\s*\|/g, '').trim()));
    assert.ok(subjects.size >= 3, `Questions should span multiple disciplines (got ${subjects.size}: ${[...subjects].join(', ')})`);
  });

  await t.test('Scenario 1: Multiple consecutive chat questions deliver 100% disjoint unique questions', async () => {
    const queries = [
      'What follow-up interview questions could be asked?',
      'give me questions',
      'ask me questions',
      'practice questions'
    ];

    const allServedIds = [];

    for (const q of queries) {
      const res = await RagService.answerStudentQuery(q, studentProfile);
      // Find question titles
      const matches = res.answer.match(/#### Question \d+/g) || [];
      assert.strictEqual(matches.length, 5);
    }

    const servedSet = chatServedQuestionTracker.get(studentProfile.id);
    assert.strictEqual(servedSet.size, 25, `All 25 questions served across the 5 total queries must be unique (got ${servedSet.size})`);
  });

  await t.test('Scenario 2: RecommendationEngine diversifies across subjects on Dashboard', () => {
    const recs = RecommendationEngine.getRecommendations(testStudentId, 4);
    assert.strictEqual(recs.length, 4, 'Returns 4 recommendations');
    const subjects = new Set(recs.map(r => r.subject_name));
    assert.ok(subjects.size >= 3, `Top 4 recommendations must span multiple subjects (got ${subjects.size}: ${[...subjects].join(', ')})`);
    assert.strictEqual(recs.filter(r => r.has_attempted).length, 0, 'All recommendations must be fresh unattempted');
  });

  await t.test('Scenario 2: Core CS Assessment balances all 5 CS disciplines and prevents repetition', () => {
    const asmt1 = QuizEngine.generateAssessment(testStudentId, 'core-cs');
    assert.strictEqual(asmt1.questions.length, 20);

    const counts = {};
    asmt1.questions.forEach(q => {
      counts[q.subject_name] = (counts[q.subject_name] || 0) + 1;
    });

    assert.ok(counts['Data Structures & Algorithms'] >= 3, 'Includes DSA questions');
    assert.ok(counts['Operating Systems'] >= 3, 'Includes OS questions');
    assert.ok(counts['Database Management Systems (DBMS)'] >= 3, 'Includes DBMS questions');
    assert.ok(counts['Computer Networks'] >= 3, 'Includes Computer Networks questions');
    assert.ok(counts['Object Oriented Programming'] >= 2, 'Includes OOP questions');

    // Immediate second assessment session must have zero overlapping questions
    const asmt2 = QuizEngine.generateAssessment(testStudentId, 'core-cs');
    assert.strictEqual(asmt2.questions.length, 20);

    const ids1 = new Set(asmt1.questions.map(q => q.id));
    const ids2 = new Set(asmt2.questions.map(q => q.id));
    const overlap = [...ids1].filter(id => ids2.has(id));

    assert.strictEqual(overlap.length, 0, `Consecutive assessments must not repeat questions (Overlap: ${overlap.join(', ')})`);
  });

  await t.test('Scenario 2: Adaptive Daily Quizzes yield unique questions across rounds', () => {
    const quiz1 = QuizEngine.generateAdaptiveDailyQuiz(testStudentId, 5);
    assert.strictEqual(quiz1.questions.length, 5);

    QuizEngine.submitQuiz(quiz1.session_id, testStudentId, quiz1.questions.map(q => ({
      question_id: q.id,
      answer: 'A',
      time_spent: 10
    })), 50);

    const quiz2 = QuizEngine.generateAdaptiveDailyQuiz(testStudentId, 5);
    assert.strictEqual(quiz2.questions.length, 5);

    const q1Ids = new Set(quiz1.questions.map(q => q.id));
    const q2Ids = new Set(quiz2.questions.map(q => q.id));
    const overlap = [...q1Ids].filter(id => q2Ids.has(id));
    assert.strictEqual(overlap.length, 0, `Quiz 2 must not repeat questions from Quiz 1`);
  });

  // Cleanup test user
  try {
    db.delete('users', testStudentId);
    chatServedQuestionTracker.delete(testStudentId);
  } catch (err) {
    // ignore cleanup
  }
});
