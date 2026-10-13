import express from 'express';
import { authenticate } from '../middleware/auth.js';
import RagService from '../services/ragService.js';
import db from '../database/db.js';

import { SUPPORTED_MODELS } from '../services/ragService.js';

const router = express.Router();

// GET /api/preppilot/models
router.get('/models', authenticate, (req, res) => {
  const hasSystemKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return res.json({
    success: true,
    models: SUPPORTED_MODELS,
    active_default: 'gemini-2.5-flash',
    has_system_key: hasSystemKey
  });
});

// POST /api/preppilot/chat
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, model, apiKey } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message query cannot be empty.' });
    }

    const studentProfile = req.user;
    const selectedModel = model || 'gemini-2.5-flash';
    const ragResult = await RagService.answerStudentQuery(message, studentProfile, selectedModel, apiKey);

    return res.json({
      success: true,
      query: message,
      reply: ragResult.answer,
      speech_text: ragResult.speechText,
      sources: ragResult.sources,
      retrieved_documents: ragResult.retrievedDocuments,
      model: ragResult.model,
      is_live_api: Boolean(ragResult.isLiveApi)
    });
  } catch (err) {
    console.error('[PrepPilot Chat Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'PrepPilot temporary synthesis delay. Please try asking again.',
      reply: 'I encountered a brief latency. As your placement copilot, feel free to repeat your technical query!'
    });
  }
});

// GET /api/preppilot/knowledge
router.get('/knowledge', authenticate, (req, res) => {
  const docs = db.getAll('knowledgeDocuments').map(d => ({
    id: d.id,
    title: d.title,
    category: d.category,
    summary: d.summary,
    keywords: d.keywords,
    subject_id: d.subject_id,
    company_id: d.company_id
  }));

  return res.json({ success: true, documents: docs });
});

// POST /api/preppilot/diagnose-mistakes
// Provides thorough voice synthesis text and remediation guide for quiz or coding mistakes
router.post('/diagnose-mistakes', authenticate, async (req, res) => {
  try {
    const { type, gradedQuestions, weak_topics, accuracy_rate, codingMistake } = req.body;

    if (type === 'coding') {
      const { problemTitle, status, failedTestCase, language, codeSnippet } = codingMistake || {};
      
      let voiceScript = `Hello! Here is your PrepPilot coding diagnostic for ${problemTitle || 'this problem'}. `;
      let whatWentWrong = '';
      let whatToDo = '';

      if (status === 'WRONG_ANSWER') {
        whatWentWrong = `Your code produced output "${failedTestCase?.actualOutput || 'different output'}" instead of the expected "${failedTestCase?.expectedOutput || 'correct result'}". `;
        whatToDo = `Double check your boundary logic and edge cases. In placement tests, algorithms must handle empty inputs, duplicate elements, and proper indexing. Trace your code with sample input "${failedTestCase?.input || 'the failed test case'}".`;
        voiceScript += `Your submission resulted in a Wrong Answer on the test suite. Specifically, for input ${failedTestCase?.input || 'tested'}, your output did not match the expected result. ${whatToDo}`;
      } else if (status === 'TIME_LIMIT_EXCEEDED') {
        whatWentWrong = `Your code exceeded the execution time limit of 2 seconds. `;
        whatToDo = `This usually indicates an O(N squared) nested loop where an O(N) or O(N log N) approach using Hash Maps, Two Pointers, or Binary Search is required. Avoid repetitive scans.`;
        voiceScript += `Your solution timed out. That means the time complexity is too high for large placement test inputs. Consider replacing quadratic nested loops with a hash map or two-pointer technique.`;
      } else if (status === 'RUNTIME_ERROR') {
        whatWentWrong = `Your code threw a runtime exception or syntax error. `;
        whatToDo = `Verify array bounds to prevent out-of-bounds indexing, check for null or undefined pointers, and ensure all imported modules and types match the problem requirements.`;
        voiceScript += `Your code threw a runtime error during test case execution. Check for index out-of-bounds, unhandled empty cases, or type conversion mismatches.`;
      } else {
        voiceScript += `All test cases passed successfully! Excellent work maintaining algorithmic rigor and zero bias in test clearance.`;
      }

      return res.json({
        success: true,
        speech_text: voiceScript,
        diagnosis: {
          status,
          whatWentWrong,
          whatToDo,
          problemTitle
        }
      });
    }

    // Default: Quiz mistakes diagnostic
    const incorrectQuestions = (gradedQuestions || []).filter(q => !q.is_correct);

    if (incorrectQuestions.length === 0) {
      const voiceScript = `Outstanding performance! You achieved an accuracy rate of ${accuracy_rate || 100} percent with zero incorrect answers. Keep up this consistency for your upcoming campus placement drives!`;
      return res.json({
        success: true,
        speech_text: voiceScript,
        overview: 'Perfect score! No mistakes detected.',
        mistakes: [],
        recommendations: ['Maintain daily streaks', 'Try Hard difficulty coding challenges']
      });
    }

    // Build pedagogical script
    let speechParts = [
      `Hi there! Let's examine where you faced difficulties in this session and what you should do next.`
    ];

    const mistakes = [];

    incorrectQuestions.slice(0, 3).forEach((q, idx) => {
      const qNum = idx + 1;
      const topic = q.topic_name || q.subject_name || 'Core Concept';
      const cleanExp = (q.explanation || '')
        .replace(/[#*`_\[\]()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const itemDiagnosis = `In question ${qNum} regarding ${topic}, you chose "${q.chosen_answer}", but the correct answer is "${q.correct_answer}".`;
      const itemRemediation = cleanExp || `Review the theoretical definitions and standard interview rules for ${topic}.`;

      speechParts.push(`${itemDiagnosis} Here is why: ${itemRemediation}`);

      mistakes.push({
        questionNumber: qNum,
        question: q.question,
        chosenAnswer: q.chosen_answer,
        correctAnswer: q.correct_answer,
        topic,
        diagnosis: itemDiagnosis,
        remediation: itemRemediation
      });
    });

    const weakList = (weak_topics && weak_topics.length > 0)
      ? weak_topics.join(', ')
      : incorrectQuestions.map(q => q.topic_name).filter(Boolean).slice(0, 2).join(', ');

    speechParts.push(
      `To solidify these concepts, spend 15 minutes reviewing ${weakList || 'these topics'}, then re-attempt targeted practice questions in the quiz engine.`
    );

    const fullSpeech = speechParts.join(' ');

    return res.json({
      success: true,
      speech_text: fullSpeech,
      overview: `Detected ${incorrectQuestions.length} conceptual gaps across: ${weakList || 'tested topics'}.`,
      mistakes,
      recommendations: [
        `Review theoretical foundations for ${weakList || 'key topics'}`,
        'Practice 5 targeted questions in Custom Practice mode',
        'Ask PrepPilot Voice Assistant any clarifying doubts'
      ]
    });
  } catch (err) {
    console.error('[PrepPilot Diagnose Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate voice diagnostic.'
    });
  }
});

// POST /api/preppilot/explain-single-mistake
// Generates a quick, focused voice explanation for a single question mistake
router.post('/explain-single-mistake', authenticate, (req, res) => {
  try {
    const { question, chosen_answer, correct_answer, explanation, topic_name } = req.body;

    const cleanExplanation = (explanation || '')
      .replace(/[#*`_\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const voiceScript = `For this question on ${topic_name || 'this topic'}, you selected ${chosen_answer}, but the correct answer is ${correct_answer}. The reason is: ${cleanExplanation}. What you should do: Revisit the core rules of ${topic_name || 'this subject'} and pay attention to edge-case definitions during interview viva questions.`;

    return res.json({
      success: true,
      speech_text: voiceScript,
      topic: topic_name
    });
  } catch (err) {
    console.error('[PrepPilot Single Mistake Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to explain mistake.'
    });
  }
});

export default router;
