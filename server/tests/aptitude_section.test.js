import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { startServer } from '../src/index.js';
import db from '../src/database/db.js';

describe('PrepPilot AI — Aptitude Section Integration Tests', () => {
  let server;
  let baseUrl;
  let studentToken;
  let testSessionId;
  let sampleQuestionId;

  before(async () => {
    // Start test server on dynamic port
    const testPort = 5088;
    server = await startServer(testPort);
    baseUrl = `http://127.0.0.1:${testPort}/api`;

    // Authenticate as demo student
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'balamwarshashwat@gmail.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.success, true, 'Student login should succeed');
    studentToken = loginData.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('1. GET /api/aptitude/types returns all 4 aptitude categories with stats', async () => {
    const res = await fetch(`${baseUrl}/aptitude/types`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();

    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.categories), 'Categories should be an array');
    assert.strictEqual(data.categories.length, 4, 'Should contain 4 core aptitude categories');

    const catIds = data.categories.map(c => c.id);
    assert.ok(catIds.includes('quant'), 'Should include Quantitative Aptitude');
    assert.ok(catIds.includes('logic'), 'Should include Logical Reasoning');
    assert.ok(catIds.includes('verbal'), 'Should include Verbal Ability');
    assert.ok(catIds.includes('di'), 'Should include Data Interpretation');

    // Verify subtopics and live counts
    for (const cat of data.categories) {
      assert.ok(cat.subtopics.length > 0, `${cat.name} must list subtopics`);
      assert.ok(cat.questionCount > 0, `${cat.name} must have questions`);
    }

    assert.ok(data.overall.totalQuestions >= 40, 'Total questions should be at least 40');
  });

  it('2. GET /api/aptitude/questions supports filtering by category type with at least 100 unique questions in non-random deterministic order', async () => {
    const sections = ['quant', 'logic', 'verbal', 'di'];

    for (const sectionType of sections) {
      const res = await fetch(`${baseUrl}/aptitude/questions?type=${sectionType}&limit=150`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const data = await res.json();
      assert.strictEqual(data.success, true, `Fetching ${sectionType} questions should succeed`);
      assert.ok(data.questions.length >= 100, `Section ${sectionType} must have at least 100 questions (found ${data.questions.length})`);

      // Verify questions are strictly as per the section and not random
      const uniqueTexts = new Set();
      let lastSeq = -1;

      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        assert.strictEqual(q.category_id, sectionType, `Question ${q.id} must strictly belong to section ${sectionType}`);
        assert.ok(q.options.length >= 4, `Question ${q.id} must have at least 4 options`);
        assert.ok(q.explanation, `Question ${q.id} must have step-by-step derivation`);

        // Check uniqueness
        const normalizedText = q.question.trim().toLowerCase();
        assert.ok(!uniqueTexts.has(normalizedText), `Question text must be unique: "${q.question.substring(0, 40)}..."`);
        uniqueTexts.add(normalizedText);

        // Check non-random deterministic sequence progression
        const currentSeq = typeof q.sequence === 'number' ? q.sequence : (i + 1);
        assert.ok(currentSeq >= lastSeq, `Questions must follow non-random deterministic order: seq ${currentSeq} >= ${lastSeq}`);
        lastSeq = currentSeq;
      }

      assert.ok(uniqueTexts.size >= 100, `Section ${sectionType} must contain at least 100 unique question texts (found ${uniqueTexts.size})`);
    }

    // Save sample question ID for answer checking test
    const quantRes = await fetch(`${baseUrl}/aptitude/questions?type=quant&limit=5`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const quantData = await quantRes.json();
    sampleQuestionId = quantData.questions[0].id;
  });

  it('3. GET /api/aptitude/questions supports difficulty and company filters', async () => {
    const diffRes = await fetch(`${baseUrl}/aptitude/questions?difficulty=Easy&limit=5`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const diffData = await diffRes.json();
    assert.strictEqual(diffData.success, true);
    for (const q of diffData.questions) {
      assert.strictEqual(q.difficulty, 'Easy');
    }
  });

  it('4. POST /api/aptitude/check-answer verifies answer in practice mode with step-by-step derivation', async () => {
    // Fetch question to find its correct answer
    const q = db.get('questions', sampleQuestionId);
    assert.ok(q, 'Sample question must exist in database');

    const checkRes = await fetch(`${baseUrl}/aptitude/check-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        question_id: sampleQuestionId,
        chosen_option: q.correct_answer,
        time_spent: 30
      })
    });

    assert.strictEqual(checkRes.status, 200);
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.success, true);
    assert.strictEqual(checkData.is_correct, true);
    assert.strictEqual(checkData.correct_answer, q.correct_answer);
    assert.ok(checkData.explanation.length > 0, 'Explanation must be returned');
    assert.ok(checkData.xp_earned > 0, 'XP must be awarded for correct answer');
  });

  it('5. POST /api/aptitude/session/start initializes a timed aptitude test', async () => {
    const startRes = await fetch(`${baseUrl}/aptitude/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        type: 'all',
        difficulty: 'All',
        count: 5,
        duration_minutes: 10
      })
    });

    assert.strictEqual(startRes.status, 200);
    const startData = await startRes.json();
    assert.strictEqual(startData.success, true);
    assert.ok(startData.session_id);
    assert.strictEqual(startData.mode, 'APTITUDE_TEST');
    assert.strictEqual(startData.total_questions, 5);
    assert.strictEqual(startData.questions.length, 5);

    // Ensure correct answers are hidden during active test
    for (const q of startData.questions) {
      assert.strictEqual(q.correct_answer, undefined, 'Answers must be hidden during test');
      assert.strictEqual(q.explanation, undefined, 'Explanations must be hidden during test');
    }

    testSessionId = startData.session_id;
  });

  it('6. POST /api/aptitude/session/:id/submit grades aptitude test and returns scorecard', async () => {
    assert.ok(testSessionId, 'Test session ID must exist');

    const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === testSessionId);
    assert.ok(sessionQuestions.length > 0);

    // Prepare answers (answering first 3 correctly, leaving others)
    const answers = sessionQuestions.slice(0, 3).map(qq => {
      const q = db.get('questions', qq.question_id);
      return {
        question_id: qq.question_id,
        chosen_option: q.correct_answer,
        time_spent: 40
      };
    });

    const submitRes = await fetch(`${baseUrl}/aptitude/session/${testSessionId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        answers,
        total_time_taken: 120
      })
    });

    assert.strictEqual(submitRes.status, 200);
    const submitData = await submitRes.json();
    assert.strictEqual(submitData.success, true);
    assert.strictEqual(submitData.result.status, 'COMPLETED');
    assert.strictEqual(submitData.result.correct_count, 3);
    assert.strictEqual(submitData.result.accuracy_rate, 60); // 3 out of 5 = 60%
    assert.ok(submitData.result.xp_earned > 0);
    assert.strictEqual(submitData.result.graded_questions.length, 5);
  });

  it('7. GET /api/aptitude/formulas returns speed math cheat sheets', async () => {
    const res = await fetch(`${baseUrl}/aptitude/formulas`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.cheat_sheets));
    assert.ok(data.cheat_sheets.length >= 3, 'Must have at least 3 formula categories');

    const titles = data.cheat_sheets.map(c => c.category);
    assert.ok(titles.includes('Quantitative Aptitude'));
    assert.ok(titles.includes('Logical Reasoning'));
    assert.ok(titles.includes('Data Interpretation'));
  });
});
