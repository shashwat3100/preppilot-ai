import test from 'node:test';
import assert from 'node:assert/strict';
import QuizEngine from '../src/services/quizEngine.js';
import { startServer } from '../src/index.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'careerprep-default-dev-secret-key-2025';

test('Voice Mistake Mentor — Empirical Verification', async (t) => {
  const testPort = 5199;
  const server = await startServer(testPort);
  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  const token = jwt.sign(
    { id: 'user-student-demo', email: 'student@preppilot.ai', role: 'STUDENT' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  await t.test('1. explainMistakeDetails correctly detects negative constraint and provides deep reasoning', () => {
    const question = {
      id: 'q-os-1',
      question: 'Which of the following is NOT one of the four necessary Coffman conditions required for a Deadlock to occur in an operating system?',
      correct_answer: 'B',
      explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemptive Allocation is a technique to PREVENT deadlocks, not cause them.'
    };

    const chosenOpt = { option_key: 'D', option_text: 'Circular Wait' };
    const correctOpt = { option_key: 'B', option_text: 'Preemptive Resource Allocation' };
    const topic = { name: 'Deadlock Detection & Prevention' };
    const subject = { name: 'Operating Systems' };

    const details = QuizEngine.explainMistakeDetails(question, 'D', chosenOpt, correctOpt, subject, topic);

    assert.equal(details.isNegativeQuestion, true, 'Must detect negative constraint in question');
    assert.equal(details.chosenText, 'Circular Wait');
    assert.equal(details.correctText, 'Preemptive Resource Allocation');
    assert.match(details.whyIncorrect, /negative constraint|Circular Wait|established.*valid.*condition/i, 'Must explain why choosing Circular Wait is wrong on a negative question');
    assert.match(details.whyCorrect, /Preemptive Resource Allocation/i, 'Must identify exact correct answer text');
    assert.match(details.whyCorrect, /PREVENT deadlocks|prevention technique|exception/i, 'Must provide deep conceptual proof');
  });

  await t.test('2. POST /api/preppilot/diagnose-mistakes returns rich structured mistakes and audible breakdown', async () => {
    const gradedQuestions = [
      {
        question_id: 'q-os-1',
        sequence: 4,
        question: 'Which of the following is NOT one of the four necessary Coffman conditions required for a Deadlock to occur in an operating system?',
        chosen_answer: 'D',
        chosen_text: 'Circular Wait',
        correct_answer: 'B',
        correct_text: 'Preemptive Resource Allocation',
        is_correct: false,
        is_negative_constraint: true,
        topic_name: 'Deadlock Detection & Prevention',
        subject_name: 'Operating Systems',
        explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemptive Allocation is a technique to PREVENT deadlocks, not cause them.'
      }
    ];

    const response = await fetch(`${baseUrl}/preppilot/diagnose-mistakes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'quiz',
        gradedQuestions,
        weak_topics: ['Deadlock Detection & Prevention'],
        accuracy_rate: 60
      })
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.mistakes), 'Must return mistakes array');
    assert.equal(body.mistakes.length, 1);

    const m = body.mistakes[0];
    assert.equal(m.sequence, 4, 'Must preserve actual question sequence number');
    assert.equal(m.chosen_answer, 'D');
    assert.equal(m.chosen_text, 'Circular Wait');
    assert.equal(m.correct_answer, 'B');
    assert.equal(m.correct_text, 'Preemptive Resource Allocation');
    assert.equal(m.is_negative_constraint, true);
    assert.ok(m.viva_tip, 'Must include placement viva tip');
    assert.match(m.viva_tip, /Coffman|Deadlock/i);

    // Spoken speech text must mention both options and why choosing D was wrong
    assert.match(body.speech_text, /Question 4/i, 'Spoken text must state Question 4');
    assert.match(body.speech_text, /negative constraint|not apply/i, 'Spoken text must state negative condition');
    assert.match(body.speech_text, /Option D.*Circular Wait/i, 'Spoken text must state chosen Option D and full text');
    assert.match(body.speech_text, /Option B.*Preemptive Resource Allocation/i, 'Spoken text must state exact correct Option B and full text');
    assert.match(body.speech_text, /Viva Key|Takeaway/i, 'Spoken text must include viva key');
  });

  await t.test('3. POST /api/preppilot/explain-single-mistake returns focused voice breakdown with full options', async () => {
    const response = await fetch(`${baseUrl}/preppilot/explain-single-mistake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question_id: 'q-os-1',
        sequence: 4,
        question: 'Which of the following is NOT one of the four necessary Coffman conditions required for a Deadlock to occur in an operating system?',
        chosen_answer: 'D',
        chosen_text: 'Circular Wait',
        correct_answer: 'B',
        correct_text: 'Preemptive Resource Allocation',
        topic_name: 'Deadlock Detection & Prevention',
        explanation: 'The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Preemptive Allocation is a technique to PREVENT deadlocks, not cause them.'
      })
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.speech_text, 'Must return spoken speech text');
    assert.match(body.speech_text, /Option D.*Circular Wait/i, 'Must state chosen option and text');
    assert.match(body.speech_text, /Option B.*Preemptive Resource Allocation/i, 'Must state correct option and text');
    assert.ok(body.diagnosis, 'Must return structured diagnosis object');
    assert.equal(body.diagnosis.chosen_text, 'Circular Wait');
    assert.equal(body.diagnosis.correct_text, 'Preemptive Resource Allocation');
  });
});
