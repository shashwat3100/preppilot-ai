import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/index.js';
import MistakeVaultService from '../src/services/mistakeVaultService.js';
import db from '../src/database/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'careerprep-default-dev-secret-key-2025';

test('Mistake Vault & Revision Drill — Empirical Verification', async (t) => {
  const testPort = 5218;
  const server = await startServer(testPort);
  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  const studentId = 'user-student-demo';
  const token = jwt.sign(
    { id: studentId, email: 'student@preppilot.ai', role: 'STUDENT' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  await t.test('1. Record mistake in vault and verify structure', () => {
    const testQid = 'q-os-1';
    MistakeVaultService.recordAttempt({
      userId: studentId,
      questionId: testQid,
      chosenAnswer: 'D',
      isCorrect: false,
      attemptId: 'att-test-1',
      sourceType: 'quiz'
    });

    const item = db.get('mistakeVault', `mv-${studentId}-${testQid}`);
    assert.ok(item, 'Mistake vault record should exist');
    assert.equal(item.mastery_status, 'unresolved', 'Initial mistake status must be unresolved');
    assert.equal(item.last_chosen_answer, 'D', 'Chosen answer must match');
    assert.ok(item.mistake_count >= 1, 'Mistake count should be >= 1');
  });

  await t.test('2. GET /api/quiz/mistakes returns enriched mistake analytics', async () => {
    const res = await fetch(`${baseUrl}/quiz/mistakes`, { headers: authHeaders });
    assert.equal(res.status, 200, 'GET /api/quiz/mistakes should return 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.stats, 'Should contain stats');
    assert.ok(typeof data.stats.unresolved_count === 'number');
    assert.ok(Array.isArray(data.mistakes), 'Should contain mistakes list');
    assert.ok(data.mistakes.length > 0, 'Should have at least 1 mistake recorded');

    const first = data.mistakes.find(m => m.question_id === 'q-os-1');
    assert.ok(first, 'q-os-1 should be in the returned mistakes');
    assert.ok(first.why_incorrect, 'Must have deep why_incorrect explanation');
    assert.ok(first.why_correct, 'Must have deep why_correct explanation');
    assert.ok(first.options.length > 0, 'Must have options');
  });

  let drillSessionId = null;

  let drillQuestions = [];

  await t.test('3. POST /api/quiz/mistakes/drill generates active revision drill session', async () => {
    const res = await fetch(`${baseUrl}/quiz/mistakes/drill`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ count: 5 })
    });

    assert.equal(res.status, 200, 'Drill generation should return 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.session_id, 'Should have session_id');
    assert.equal(data.mode, 'MISTAKE_DRILL', 'Mode should be MISTAKE_DRILL');
    assert.ok(Array.isArray(data.questions));
    assert.ok(data.questions.length > 0, 'Should return drill questions');
    assert.ok(data.questions[0].previous_mistake_count >= 1);

    drillSessionId = data.session_id;
    drillQuestions = data.questions;
  });

  await t.test('4. POST /api/quiz/mistakes/drill/submit evaluates and marks question as mastered', async () => {
    assert.ok(drillSessionId, 'Must have active drillSessionId');
    assert.ok(drillQuestions.length > 0, 'Must have drill questions');

    // Submit correct answers for all questions in the drill
    const answers = drillQuestions.map(dq => {
      const qObj = db.get('questions', dq.id);
      return {
        question_id: dq.id,
        chosen_option: qObj ? qObj.correct_answer : 'A',
        time_spent: 20
      };
    });

    const res = await fetch(`${baseUrl}/quiz/mistakes/drill/submit`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        session_id: drillSessionId,
        answers,
        total_time_taken: 25
      })
    });

    assert.equal(res.status, 200, 'Submit drill should return 200');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.result);
    assert.equal(data.result.status, 'COMPLETED');
    assert.ok(data.result.newly_mastered_count >= 1, 'Should have at least 1 newly mastered question');

    // Verify first question in mistakeVault is now mastered
    const masteredQid = drillQuestions[0].id;
    const item = db.get('mistakeVault', `mv-${studentId}-${masteredQid}`);
    assert.equal(item.mastery_status, 'mastered', 'Question in mistakeVault must now be mastered');
    assert.ok(item.mastered_at, 'mastered_at timestamp must be set');
  });

  await t.test('5. POST /api/quiz/mistakes/:id/toggle-mastery toggles mastery status', async () => {
    const targetQid = drillQuestions[0].id;
    const res = await fetch(`${baseUrl}/quiz/mistakes/${targetQid}/toggle-mastery`, {
      method: 'POST',
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.mastery_status, 'unresolved', 'Toggling mastered item should make it unresolved');
  });
});
