import express from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import RagService from '../services/ragService.js';
import db from '../database/db.js';

import { SUPPORTED_MODELS } from '../services/ragService.js';

const router = express.Router();

// GET /api/preppilot/models
router.get('/models', optionalAuthenticate, (req, res) => {
  const hasSystemKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return res.json({
    success: true,
    models: SUPPORTED_MODELS,
    active_default: 'gemini-2.5-flash',
    has_system_key: hasSystemKey
  });
});

// POST /api/preppilot/chat
router.post('/chat', optionalAuthenticate, async (req, res) => {
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
router.get('/knowledge', optionalAuthenticate, (req, res) => {
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

/**
 * Generates an empathetic, deep, and unambiguous pedagogical diagnosis for a quiz mistake.
 * Accurately articulates:
 * 1) Exact question number & question premise (including negative constraints like "NOT" / "EXCEPT").
 * 2) The student's chosen option letter and full option text, explaining WHY selecting it is incorrect.
 * 3) The exact correct option letter and full option text, explaining the deep technical reason WHY it is right.
 * 4) An actionable campus interview viva key.
 */
async function generateDeepMistakeDiagnosis(q, qIndex, apiKey = null) {
  let dbQ = null;
  let dbOpts = [];
  const qId = q.question_id || q.id;
  if (qId) {
    dbQ = db.get('questions', qId);
    dbOpts = db.find('questionOptions', opt => opt.question_id === qId);
  }

  const questionText = q.question || dbQ?.question || 'Technical Problem';
  const topic = q.topic_name || q.topic || dbQ?.topic_id || 'Core Concept';
  const subject = q.subject_name || q.subject || 'Engineering Subject';
  const chosenKey = (q.chosen_answer || q.user_answer || '').trim().toUpperCase();
  const correctKey = (q.correct_answer || dbQ?.correct_answer || '').trim().toUpperCase();

  const optionsList = (q.options && q.options.length > 0) ? q.options : dbOpts;
  const chosenOpt = optionsList.find(o => (o.option_key || '').toUpperCase() === chosenKey);
  const correctOpt = optionsList.find(o => (o.option_key || '').toUpperCase() === correctKey);

  const chosenText = q.chosen_text || chosenOpt?.option_text || (chosenKey ? `Option ${chosenKey}` : 'No response');
  const correctText = q.correct_text || correctOpt?.option_text || correctKey;

  const sequenceNum = q.sequence || q.sequence_order || q.questionNumber || (qIndex != null ? qIndex + 1 : 1);
  const isNegative = q.is_negative_constraint != null
    ? Boolean(q.is_negative_constraint)
    : /\b(NOT|EXCEPT|FALSE|INCORRECT|NEVER|CANNOT|CAN NOT|LEAST)\b/i.test(questionText);

  const cleanExplanation = (q.explanation || dbQ?.explanation || '')
    .replace(/[#*`_\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Check if Gemini Live AI is available
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (effectiveApiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const prompt = `You are PrepPilot, an elite B.Tech campus placement voice coach. A student made a conceptual mistake on Question ${sequenceNum}.
Question: "${questionText}"
Options:
${optionsList.map(o => `${o.option_key}: ${o.option_text}`).join('\n')}
Student Chose: Option ${chosenKey} ("${chosenText}")
Exact Correct Answer: Option ${correctKey} ("${correctText}")
Topic: ${topic}
Verified Technical Explanation: ${cleanExplanation}

Generate a clear, authoritative, and encouraging verbal explanation for text-to-speech narration:
1. State Question ${sequenceNum} and topic (${topic}). If the question has a negative constraint (such as "NOT" or "EXCEPT"), explicitly point this out so the student understands the premise.
2. Clearly state that they selected Option ${chosenKey}: "${chosenText}", and explain why choosing it was incorrect.
3. Clearly state that the exact correct answer is Option ${correctKey}: "${correctText}", and deeply explain the underlying technical mechanism.
4. Conclude with an "Interview Viva Takeaway".
IMPORTANT: Do NOT use markdown symbols, asterisks, bullet points, or special characters. Speak directly in clean, audible sentences.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.2 }
      });

      if (response && response.text) {
        const liveText = response.text
          .replace(/[#*`_\[\]()]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (liveText.length > 60) {
          return {
            questionNumber: sequenceNum,
            sequence: sequenceNum,
            question_id: qId,
            question: questionText,
            topic,
            subject,
            chosen_answer: chosenKey,
            chosen_text: chosenText,
            correct_answer: correctKey,
            correct_text: correctText,
            is_negative_constraint: isNegative,
            why_chosen_wrong: q.why_incorrect || `You selected Option ${chosenKey}: "${chosenText}". ${isNegative ? `Because the question asks which is NOT true, choosing "${chosenText}" is incorrect as it is an established requirement for ${topic}.` : `This does not satisfy the requirements of ${topic}.`}`,
            why_correct: q.why_correct || `The exact correct answer is Option ${correctKey}: "${correctText}". ${cleanExplanation}`,
            technical_deep_dive: cleanExplanation || `Option ${correctKey} is the verified standard.`,
            viva_tip: `Interview Viva Tip: Pay close attention to negative constraints (NOT, EXCEPT) and core invariants in ${topic}.`,
            speech_text: liveText,
            is_live_ai: true
          };
        }
      }
    } catch (geminiErr) {
      console.warn('[Diagnose] Gemini live synthesis error, falling back to grounded technical mentor:', geminiErr.message);
    }
  }

  // 2. High-Yield Grounded Deterministic Technical Mentor Fallback
  let whyWrong = q.why_incorrect;
  if (!whyWrong) {
    if (isNegative) {
      whyWrong = `You selected Option ${chosenKey}: "${chosenText}". Notice that the question contains a negative constraint asking which option is NOT required. "${chosenText}" is actually an essential, standard requirement for ${topic}, which makes selecting it here incorrect.`;
    } else {
      whyWrong = `You selected Option ${chosenKey}: "${chosenText}". This option does not satisfy the technical requirements for ${topic} in this scenario.`;
    }
  }

  let whyRight = q.why_correct;
  if (!whyRight) {
    if (isNegative) {
      whyRight = `The exact correct answer is Option ${correctKey}: "${correctText}". ${cleanExplanation || `Because "${correctText}" is an exception or prevention measure, it is NOT one of the required conditions.`}`;
    } else {
      whyRight = `The exact correct answer is Option ${correctKey}: "${correctText}". ${cleanExplanation || `Option ${correctKey} is the authoritative principle for ${topic}.`}`;
    }
  }

  // Viva Key tailored to topic
  let vivaTip = '';
  const searchStr = (topic + ' ' + questionText).toLowerCase();
  if (searchStr.includes('deadlock') || searchStr.includes('coffman')) {
    vivaTip = 'Viva Key: In technical interviews, remember that all 4 Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) must hold simultaneously for a deadlock to exist. Denying any single condition completely prevents deadlocks.';
  } else if (searchStr.includes('paging') || searchStr.includes('virtual memory') || searchStr.includes('tlb')) {
    vivaTip = 'Viva Key: Virtual memory questions often test the difference between page faults (an OS software trap) and TLB misses (a hardware lookup miss).';
  } else if (searchStr.includes('scheduling') || searchStr.includes('round robin') || searchStr.includes('fcfs')) {
    vivaTip = 'Viva Key: A large time quantum makes Round Robin behave like FCFS, whereas a very short quantum introduces excessive context-switching overhead.';
  } else if (searchStr.includes('b+ tree') || searchStr.includes('indexing') || searchStr.includes('b-tree')) {
    vivaTip = 'Viva Key: B+ Trees store all actual record pointers at leaf nodes connected by a linked list, which is why database engines use them for fast range queries.';
  } else if (searchStr.includes('acid') || searchStr.includes('transaction')) {
    vivaTip = 'Viva Key: In DBMS viva, remember: Atomicity and Durability are guaranteed by the recovery log (WAL), while Isolation is enforced by two-phase locking (2PL).';
  } else if (searchStr.includes('normalization') || searchStr.includes('bcnf') || searchStr.includes('3nf')) {
    vivaTip = 'Viva Key: 3NF preserves functional dependencies and guarantees lossless join, whereas BCNF eliminates all anomalies from non-superkey determinants but may not preserve dependencies.';
  } else if (searchStr.includes('tcp') || searchStr.includes('udp') || searchStr.includes('three-way')) {
    vivaTip = 'Viva Key: TCP three-way handshake uses SYN, SYN-ACK, ACK. TCP provides reliable byte-stream transfer with congestion control, while UDP provides connectionless, low-overhead datagrams.';
  } else if (isNegative) {
    vivaTip = 'Viva Key: In fast-paced technical screening rounds, always look out for negative qualifiers like NOT, EXCEPT, or FALSE in the problem statement.';
  } else {
    vivaTip = `Viva Key: When answering questions on ${topic}, begin by stating the formal definition, followed by complexity analysis or architectural trade-offs.`;
  }

  // Build spoken speech script
  let spokenScript = '';
  if (isNegative) {
    spokenScript = `In Question ${sequenceNum} regarding ${topic}: The question asked: "${questionText.replace(/[?.]/g, '')}". Notice that this question contains a negative constraint asking which option does not apply. You selected Option ${chosenKey}: ${chosenText}. However, ${chosenText} is actually an essential requirement, which is why selecting it was incorrect. The exact correct answer is Option ${correctKey}: ${correctText}. ${cleanExplanation ? cleanExplanation : `Because ${correctText} prevents or breaks the condition, it is not one of the required conditions.`} ${vivaTip}`;
  } else {
    spokenScript = `In Question ${sequenceNum} regarding ${topic}: You selected Option ${chosenKey}: ${chosenText}. However, this does not satisfy the requirements. The exact correct answer is Option ${correctKey}: ${correctText}. ${cleanExplanation ? cleanExplanation : `Option ${correctKey} is the correct answer.`} ${vivaTip}`;
  }

  return {
    questionNumber: sequenceNum,
    sequence: sequenceNum,
    question_id: qId,
    question: questionText,
    topic,
    subject,
    chosen_answer: chosenKey,
    chosen_text: chosenText,
    correct_answer: correctKey,
    correct_text: correctText,
    is_negative_constraint: isNegative,
    why_chosen_wrong: whyWrong,
    why_correct: whyRight,
    technical_deep_dive: cleanExplanation || whyRight,
    viva_tip: vivaTip,
    speech_text: spokenScript,
    is_live_ai: false
  };
}

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

    // Build pedagogical diagnoses for mistakes
    const diagnosedMistakes = [];
    const speechParts = [
      `Hi there! Let's examine where you faced difficulties in this session and what you should do next.`
    ];

    const questionsToDiagnose = incorrectQuestions.slice(0, 3);
    for (let i = 0; i < questionsToDiagnose.length; i++) {
      const diag = await generateDeepMistakeDiagnosis(questionsToDiagnose[i], i, req.body.apiKey);
      diagnosedMistakes.push(diag);
      speechParts.push(diag.speech_text);
    }

    const weakList = (weak_topics && weak_topics.length > 0)
      ? weak_topics.join(', ')
      : incorrectQuestions.map(q => q.topic_name).filter(Boolean).slice(0, 2).join(', ');

    speechParts.push(
      `To solidify these concepts, spend 15 minutes reviewing theoretical foundations for ${weakList || 'these topics'}, then re-attempt targeted practice questions in the quiz engine.`
    );

    const fullSpeech = speechParts.join(' ');

    return res.json({
      success: true,
      speech_text: fullSpeech,
      overview: `Detected ${incorrectQuestions.length} conceptual gaps across: ${weakList || 'tested topics'}.`,
      mistakes: diagnosedMistakes,
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
router.post('/explain-single-mistake', authenticate, async (req, res) => {
  try {
    const diag = await generateDeepMistakeDiagnosis(req.body, req.body.sequence || 1, req.body.apiKey);

    return res.json({
      success: true,
      speech_text: diag.speech_text,
      topic: diag.topic,
      diagnosis: diag
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
