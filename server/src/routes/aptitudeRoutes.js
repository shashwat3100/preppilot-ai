import express from 'express';
import crypto from 'crypto';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const CATEGORY_MAP = {
  quant: {
    id: 'quant',
    topicId: 'top-quant',
    name: 'Quantitative Aptitude',
    shortName: 'Quant',
    badge: 'High Campus Weightage',
    icon: 'Calculator',
    color: 'indigo',
    description: 'Arithmetic, speed math, time & work, percentages, profit & loss, ratios, numbers, and probability.',
    subtopics: [
      'Speed, Time & Distance',
      'Time & Work',
      'Profit, Loss & Discount',
      'Percentages',
      'Ratios & Proportions',
      'Simple & Compound Interest',
      'Probability & Combinatorics',
      'Number Systems & Divisibility'
    ]
  },
  logic: {
    id: 'logic',
    topicId: 'top-logic',
    name: 'Logical Reasoning',
    shortName: 'Reasoning',
    badge: 'Cognitive Screening',
    icon: 'Brain',
    color: 'cyan',
    description: 'Number/letter series, syllogisms, blood relations, seating arrangements, coding-decoding, and clocks.',
    subtopics: [
      'Number & Letter Series',
      'Syllogisms & Venn Diagrams',
      'Blood Relations',
      'Seating Arrangements',
      'Coding - Decoding',
      'Clocks & Calendars',
      'Direction Sense Test'
    ]
  },
  verbal: {
    id: 'verbal',
    topicId: 'top-verbal',
    name: 'Verbal Ability',
    shortName: 'Verbal',
    badge: 'Communication & Grammar',
    icon: 'BookOpen',
    color: 'emerald',
    description: 'Reading comprehension, grammar error spotting, sentence correction, synonyms, antonyms, and para-jumbles.',
    subtopics: [
      'Sentence Correction',
      'Grammar & Subject-Verb Agreement',
      'Vocabulary & Antonyms',
      'Para Jumbles',
      'Prepositions & Idioms'
    ]
  },
  di: {
    id: 'di',
    topicId: 'top-di',
    name: 'Data Interpretation',
    shortName: 'Data Interpretation',
    badge: 'Analytical Acumen',
    icon: 'BarChart3',
    color: 'amber',
    description: 'Tabular data analysis, bar graphs, pie charts, percentage growth calculations, and corporate caselets.',
    subtopics: [
      'Tabular Data Analysis',
      'Pie Charts & Degrees',
      'Bar Graphs & Trends',
      'Percentage Growth Rate',
      'Business Caselets'
    ]
  }
};

const FORMULA_CHEAT_SHEETS = [
  {
    category: 'Quantitative Aptitude',
    formulas: [
      {
        title: 'Speed, Distance & Time Conversion',
        formula: 'km/h to m/s: Multiply by 5/18 | m/s to km/h: Multiply by 18/5',
        tip: 'Average Speed for equal distances = (2 * u * v) / (u + v). Do NOT just average the speeds!'
      },
      {
        title: 'Train Crossing Relative Speed',
        formula: 'Opposite Direction: S_rel = S1 + S2 | Same Direction: S_rel = |S1 - S2|',
        tip: 'Distance = Length of Train 1 + Length of Train 2 (or Platform).'
      },
      {
        title: 'Time & Work (Man-Days Rule)',
        formula: '(M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2',
        tip: 'If A takes x days and B takes y days, together they take (x * y) / (x + y) days.'
      },
      {
        title: 'Compound vs Simple Interest (2 Years)',
        formula: 'Difference D = P * (R / 100)^2',
        tip: 'For 3 years: D = P * (R / 100)^2 * [(300 + R) / 100].'
      },
      {
        title: 'Successive Percentage Changes',
        formula: 'Net % Change = x + y + (x * y / 100)',
        tip: 'Use negative signs for discounts or percentage reductions.'
      },
      {
        title: 'Permutations & Combinations',
        formula: 'nPr = n! / (n - r)! | nCr = n! / [r! * (n - r)!]',
        tip: 'Choosing r items from n where order matters = nPr; order does not matter = nCr.'
      }
    ]
  },
  {
    category: 'Logical Reasoning',
    formulas: [
      {
        title: 'Clock Angle Formula',
        formula: 'Angle θ = |30*H - (11/2)*M| degrees',
        tip: 'Minute hand moves 6° per minute. Hour hand moves 0.5° per minute.'
      },
      {
        title: 'Right Angle Clocks',
        formula: 'Hands are at 90° (right angle) 44 times in 24 hours (22 times in 12 hours).',
        tip: 'They coincide 22 times in 24 hours (between 11 and 1 they coincide only once at 12:00).'
      },
      {
        title: 'Linear & Circular Seating',
        formula: 'Circular facing Center: Right = Anti-Clockwise, Left = Clockwise',
        tip: 'Fix one person as anchor position first, then populate relative positions.'
      },
      {
        title: 'Syllogism 100-50 Distribution Rule',
        formula: 'Universal statements distribute subject (All = 100/50, No = 100/100)',
        tip: 'Two negative premises yield NO valid conclusion. Positive premises never yield negative conclusions.'
      }
    ]
  },
  {
    category: 'Data Interpretation',
    formulas: [
      {
        title: 'Pie Chart Degree to Percentage',
        formula: '1% = 3.6° | Degree = (Percentage * 360) / 100',
        tip: 'A 90° sector equals exactly 25% of the total dataset.'
      },
      {
        title: 'Percentage Increase / Growth',
        formula: '% Growth = [(Final Value - Initial Value) / Initial Value] * 100',
        tip: 'Check denominator carefully—it must always be the base/initial year!'
      },
      {
        title: 'Weighted Average across Groups',
        formula: 'Avg_total = (N1*X1 + N2*X2 + ... + Nk*Xk) / (N1 + N2 + ... + Nk)',
        tip: 'Do not simply average the group averages unless sample sizes are identical.'
      }
    ]
  }
];

// Helper to resolve topic ID from category string
const getTopicIdFromType = (type) => {
  if (!type || type === 'all' || type === 'undefined' || type === 'null') return null;
  const match = CATEGORY_MAP[type.toLowerCase()];
  return match ? match.topicId : null;
};

// 1. GET /api/aptitude/types (or /categories)
router.get('/types', (req, res) => {
  try {
    const allQuestions = db.getAll('questions') || [];
    const aptitudeQuestions = allQuestions.filter(q => q.subject_id === 'sub-aptitude');

    let userAttempts = [];
    if (req.user && req.user.id) {
      userAttempts = db.find('attempts', a => a.user_id === req.user.id) || [];
    }

    const categories = Object.values(CATEGORY_MAP).map(cat => {
      const catQuestions = aptitudeQuestions.filter(q => q.topic_id === cat.topicId);
      const questionIds = new Set(catQuestions.map(q => q.id));

      const catAttempts = userAttempts.filter(a => questionIds.has(a.question_id));
      const correctAttempts = catAttempts.filter(a => a.is_correct);

      return {
        ...cat,
        questionCount: catQuestions.length,
        difficultyCounts: {
          easy: catQuestions.filter(q => q.difficulty === 'Easy').length,
          medium: catQuestions.filter(q => q.difficulty === 'Medium').length,
          hard: catQuestions.filter(q => q.difficulty === 'Hard').length
        },
        userStats: {
          attemptedCount: catAttempts.length,
          solvedCount: correctAttempts.length,
          accuracy: catAttempts.length > 0 ? Math.round((correctAttempts.length / catAttempts.length) * 100) : 0
        }
      };
    });

    const totalAptitudeCount = aptitudeQuestions.length;
    const aptQuestionIds = new Set(aptitudeQuestions.map(q => q.id));
    const allAptAttempts = userAttempts.filter(a => aptQuestionIds.has(a.question_id));
    const allAptCorrect = allAptAttempts.filter(a => a.is_correct);

    return res.json({
      success: true,
      categories,
      overall: {
        totalQuestions: totalAptitudeCount,
        totalAttempted: allAptAttempts.length,
        totalSolved: allAptCorrect.length,
        accuracy: allAptAttempts.length > 0 ? Math.round((allAptCorrect.length / allAptAttempts.length) * 100) : 0
      }
    });
  } catch (err) {
    console.error('[Aptitude Types Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to load aptitude categories.' });
  }
});

// 2. GET /api/aptitude/questions
router.get('/questions', (req, res) => {
  try {
    const rawType = req.query.type;
    const rawSubtopic = req.query.subtopic;
    const rawDiff = req.query.difficulty;
    const rawCompany = req.query.company_id;
    const rawSearch = req.query.search;
    const mode = req.query.mode || 'practice';
    const limit = req.query.limit || 150;

    const type = (!rawType || rawType === 'all' || rawType === 'undefined' || rawType === 'null') ? null : rawType;
    const subtopic = (!rawSubtopic || rawSubtopic === 'all' || rawSubtopic === 'undefined' || rawSubtopic === 'null') ? null : rawSubtopic.trim();
    const difficulty = (!rawDiff || rawDiff === 'All' || rawDiff === 'all' || rawDiff === 'undefined' || rawDiff === 'null') ? null : rawDiff;
    const company_id = (!rawCompany || rawCompany === 'all' || rawCompany === 'undefined' || rawCompany === 'null') ? null : rawCompany;
    const search = (!rawSearch || rawSearch === 'undefined' || rawSearch === 'null') ? null : rawSearch.trim();

    let questions = (db.getAll('questions') || []).filter(q => q.subject_id === 'sub-aptitude');
    const allOptions = db.getAll('questionOptions') || [];
    const allCompanies = db.getAll('companies') || [];
    const allTopics = db.getAll('topics') || [];

    // Filter by category type
    if (type) {
      const targetTopicId = getTopicIdFromType(type);
      if (targetTopicId) {
        questions = questions.filter(q => q.topic_id === targetTopicId);
      }
    }

    // Filter by subtopic
    if (subtopic) {
      const sLower = subtopic.toLowerCase();
      questions = questions.filter(q =>
        (q.subtopic && q.subtopic.toLowerCase() === sLower) ||
        (Array.isArray(q.tags) && q.tags.some(t => t.toLowerCase() === sLower))
      );
    }

    // Filter by difficulty
    if (difficulty) {
      questions = questions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Filter by company
    if (company_id) {
      questions = questions.filter(q => q.company_id === company_id);
    }

    // Filter by text search query
    if (search) {
      const s = search.toLowerCase();
      questions = questions.filter(q =>
        q.question.toLowerCase().includes(s) ||
        (q.explanation && q.explanation.toLowerCase().includes(s)) ||
        (Array.isArray(q.tags) && q.tags.some(t => t.toLowerCase().includes(s)))
      );
    }

    // Deterministic, structured non-random ordering by sequence number, subtopic, and ID
    questions.sort((a, b) => {
      const seqA = typeof a.sequence === 'number' ? a.sequence : 9999;
      const seqB = typeof b.sequence === 'number' ? b.sequence : 9999;
      if (seqA !== seqB) return seqA - seqB;
      const subA = (a.subtopic || (a.tags && a.tags[2]) || '').toString();
      const subB = (b.subtopic || (b.tags && b.tags[2]) || '').toString();
      if (subA !== subB) return subA.localeCompare(subB);
      return (a.id || '').localeCompare(b.id || '');
    });

    // Slice to limit (raised to 500 max to accommodate 100+ questions per section)
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 150, 1), 500);
    const selectedQuestions = questions.slice(0, parsedLimit);

    const enriched = selectedQuestions.map((q, idx) => {
      const qOptions = allOptions.filter(o => o.question_id === q.id);
      const company = allCompanies.find(c => c.id === q.company_id);
      const topic = allTopics.find(t => t.id === q.topic_id);

      const categoryEntry = Object.values(CATEGORY_MAP).find(c => c.topicId === q.topic_id);

      return {
        id: q.id,
        sequence: q.sequence || (idx + 1),
        question: q.question,
        question_type: q.question_type || 'MCQ',
        difficulty: q.difficulty,
        subject_id: q.subject_id,
        topic_id: q.topic_id,
        topic_name: topic?.name || categoryEntry?.name || 'Aptitude & Reasoning',
        subtopic: q.subtopic || (q.tags && q.tags[2]) || null,
        category_id: categoryEntry?.id || 'quant',
        category_name: categoryEntry?.name || 'Quantitative Aptitude',
        company_id: q.company_id || null,
        company_name: company?.name || 'Campus Recruiter General',
        expected_time: q.expected_time || 45,
        xp_value: q.xp_value || 25,
        tags: q.tags || [],
        // In practice mode, include answers and explanations so students can check instantly
        // In test mode, answers are hidden until submission
        ...(mode === 'practice' ? {
          correct_answer: q.correct_answer,
          explanation: q.explanation || `Option (${q.correct_answer}) is the correct answer.`
        } : {}),
        options: qOptions.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text,
          ...(mode === 'practice' ? {
            is_correct: o.is_correct || o.option_key === q.correct_answer,
            explanation: o.explanation || ''
          } : {})
        }))
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      total_available: questions.length,
      questions: enriched
    });
  } catch (err) {
    console.error('[Aptitude Questions Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve aptitude questions.' });
  }
});

// 3. POST /api/aptitude/check-answer (Practice Mode Instant Solver)
router.post('/check-answer', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const { question_id, chosen_option, time_spent = 30 } = req.body;

    if (!question_id || !chosen_option) {
      return res.status(400).json({ success: false, message: 'Question ID and chosen option are required.' });
    }

    const question = db.get('questions', question_id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const allOptions = db.find('questionOptions', o => o.question_id === question_id) || [];
    const isKeyMatch = Boolean(chosen_option && ((question.correct_answer || '').trim().toUpperCase() === chosen_option.trim().toUpperCase()));
    let isTextMatch = false;
    if (!isKeyMatch && chosen_option) {
      const chosenOpt = allOptions.find(o => (o.option_key || '').toUpperCase() === chosen_option.trim().toUpperCase());
      const correctOpt = allOptions.find(o => (o.option_key || '').toUpperCase() === (question.correct_answer || '').trim().toUpperCase());
      if (chosenOpt && correctOpt && chosenOpt.option_text && correctOpt.option_text) {
        isTextMatch = chosenOpt.option_text.trim().toLowerCase() === correctOpt.option_text.trim().toLowerCase();
      }
    }
    const isCorrect = isKeyMatch || isTextMatch;
    const xpGained = isCorrect ? (question.xp_value || 25) : 5;

    // Record attempt for student progress tracking
    const attemptId = `att-apt-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();
    db.insert('attempts', {
      id: attemptId,
      user_id: userId,
      question_id: question.id,
      session_id: null,
      chosen_answer: chosen_option,
      user_answer: chosen_option,
      is_correct: isCorrect,
      time_spent_seconds: time_spent,
      xp_awarded: xpGained,
      xp_gained: xpGained,
      attempted_at: nowIso,
      created_at: nowIso
    });

    // Track in Mistake Vault
    try {
      const mvId = `mv-${userId}-${question.id}`;
      const existingMv = db.get('mistakeVault', mvId);
      const nowIso = new Date().toISOString();
      if (!isCorrect) {
        if (existingMv) {
          db.update('mistakeVault', mvId, {
            last_attempt_id: attemptId,
            last_chosen_answer: chosen_option,
            mistake_count: (existingMv.mistake_count || 1) + 1,
            mastery_status: 'unresolved',
            updated_at: nowIso
          });
        } else {
          db.insert('mistakeVault', {
            id: mvId,
            user_id: userId,
            question_id: question.id,
            source_type: 'aptitude',
            last_attempt_id: attemptId,
            last_chosen_answer: chosen_option,
            mistake_count: 1,
            mastery_status: 'unresolved',
            mastered_at: null,
            created_at: nowIso,
            updated_at: nowIso
          });
        }
      } else if (existingMv && existingMv.mastery_status === 'unresolved') {
        db.update('mistakeVault', mvId, {
          last_attempt_id: attemptId,
          last_chosen_answer: chosen_option,
          mastery_status: 'mastered',
          mastered_at: nowIso,
          updated_at: nowIso
        });
      }
    } catch (mvErr) {
      console.warn('[MistakeVault Error in Aptitude Check]:', mvErr.message);
    }

    // Award XP and streak to user
    const user = db.get('users', userId);
    let newXp = (user?.total_xp || 0) + xpGained;
    let newStreak = user?.current_streak || 1;

    if (user) {
      user.total_xp = newXp;
      user.current_level = Math.floor(newXp / 250) + 1;
      db.update('users', userId, user);

      // Record XP history
      db.insert('xpHistory', {
        id: `xp-${crypto.randomUUID()}`,
        user_id: userId,
        amount: xpGained,
        reason: isCorrect ? `Aptitude Practice: Correct Answer on ${question.difficulty}` : `Aptitude Practice: Attempt Credit`,
        created_at: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      is_correct: isCorrect,
      correct_answer: question.correct_answer,
      chosen_option: chosen_option.toUpperCase(),
      explanation: question.explanation || `Option (${question.correct_answer}) is the correct answer.`,
      xp_earned: xpGained,
      user_total_xp: newXp,
      options: allOptions.map(o => ({
        option_key: o.option_key,
        option_text: o.option_text,
        is_correct: (o.option_key || '').toUpperCase() === (question.correct_answer || '').toUpperCase(),
        explanation: o.explanation || ''
      }))
    });
  } catch (err) {
    console.error('[Aptitude Check Answer Error]:', err);
    return res.status(500).json({ success: false, message: 'Error checking aptitude answer.' });
  }
});

// 4. POST /api/aptitude/session/start (Test Mode Session Creator)
router.post('/session/start', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const rawType = req.body.type;
    const rawDiff = req.body.difficulty;
    const rawCompany = req.body.company_id;
    const count = parseInt(req.body.count) || 10;
    const duration_minutes = parseInt(req.body.duration_minutes) || 15;

    const type = (!rawType || rawType === 'all' || rawType === 'undefined' || rawType === 'null') ? null : rawType;
    const difficulty = (!rawDiff || rawDiff === 'All' || rawDiff === 'all' || rawDiff === 'undefined' || rawDiff === 'null') ? null : rawDiff;
    const company_id = (!rawCompany || rawCompany === 'all' || rawCompany === 'undefined' || rawCompany === 'null') ? null : rawCompany;

    let candidateQuestions = (db.getAll('questions') || []).filter(q => q.subject_id === 'sub-aptitude');
    const allOptions = db.getAll('questionOptions') || [];
    const allTopics = db.getAll('topics') || [];

    if (type) {
      const targetTopicId = getTopicIdFromType(type);
      if (targetTopicId) {
        candidateQuestions = candidateQuestions.filter(q => q.topic_id === targetTopicId);
      }
    }

    if (difficulty) {
      candidateQuestions = candidateQuestions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (company_id) {
      candidateQuestions = candidateQuestions.filter(q => q.company_id === company_id);
    }

    if (candidateQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'No aptitude questions found matching your filter selection.' });
    }

    // Partition by student's prior attempts and active sessions to guarantee fresh questions
    const userAttempts = db.find('attempts', a => a.user_id === userId) || [];
    const userSessions = db.find('quizSessions', s => s.user_id === userId) || [];
    const userSessionIds = new Set(userSessions.map(s => s.id));
    const userQuizQuestions = db.find('quizQuestions', qq => userSessionIds.has(qq.session_id)) || [];
    const optedIds = new Set([
      ...userAttempts.map(a => a.question_id),
      ...userQuizQuestions.map(qq => qq.question_id)
    ]);

    const unattempted = candidateQuestions.filter(q => !optedIds.has(q.id));
    const attempted = candidateQuestions.filter(q => optedIds.has(q.id));

    unattempted.sort(() => 0.5 - Math.random());

    let selected = [];
    const countNeeded = Math.min(count, candidateQuestions.length);

    if (unattempted.length >= countNeeded) {
      selected = unattempted.slice(0, countNeeded);
    } else {
      selected = [...unattempted];
      const remainderNeeded = countNeeded - selected.length;
      attempted.sort(() => 0.5 - Math.random());
      selected = selected.concat(attempted.slice(0, remainderNeeded));
    }

    const sessionId = `session-apt-${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString();

    const session = {
      id: sessionId,
      user_id: userId,
      mode: 'APTITUDE_TEST',
      status: 'IN_PROGRESS',
      total_questions: selected.length,
      correct_count: 0,
      score: 0.0,
      xp_earned: 0,
      time_taken_seconds: 0,
      duration_minutes,
      expires_at: expiresAt,
      config_params: { type, difficulty, company_id, count: selected.length },
      created_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('quizSessions', session);

    selected.forEach((q, idx) => {
      db.insert('quizQuestions', {
        id: `qq-${sessionId}-${idx + 1}`,
        session_id: sessionId,
        question_id: q.id,
        sequence_order: idx + 1,
        user_answer: null,
        is_correct: null,
        time_spent_seconds: 0
      });
    });

    const questionsScrubbed = selected.map((q, idx) => {
      const qOpts = allOptions.filter(o => o.question_id === q.id);
      const topic = allTopics.find(t => t.id === q.topic_id);
      const categoryEntry = Object.values(CATEGORY_MAP).find(c => c.topicId === q.topic_id);

      return {
        id: q.id,
        sequence: idx + 1,
        question: q.question,
        question_type: q.question_type || 'MCQ',
        difficulty: q.difficulty,
        subject_name: 'General Aptitude',
        topic_name: topic?.name || categoryEntry?.name || 'Aptitude & Reasoning',
        expected_time: q.expected_time || 45,
        xp_value: q.xp_value || 25,
        options: qOpts.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text
        }))
      };
    });

    return res.json({
      success: true,
      session_id: sessionId,
      mode: 'APTITUDE_TEST',
      duration_minutes,
      expires_at: expiresAt,
      total_questions: selected.length,
      questions: questionsScrubbed
    });
  } catch (err) {
    console.error('[Aptitude Start Session Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to start aptitude assessment session.' });
  }
});

// 5. POST /api/aptitude/session/:id/submit (Grade Aptitude Test)
router.post('/session/:id/submit', authenticate, (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;
    const { answers = [], total_time_taken = 0 } = req.body;

    const session = db.get('quizSessions', sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Aptitude test session not found.' });
    }

    if (session.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized session submission.' });
    }

    const allQuestions = db.getAll('questions') || [];
    const allOptions = db.getAll('questionOptions') || [];
    const answersMap = new Map();
    answers.forEach(a => answersMap.set(a.question_id, a));

    let correctCount = 0;
    let earnedXp = 0;
    const graded = [];

    const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === sessionId) || [];

    for (const qq of sessionQuestions) {
      const q = allQuestions.find(item => item.id === qq.question_id);
      if (!q) continue;

      const userAnsObj = answersMap.get(q.id);
      const chosenOptionKey = userAnsObj?.chosen_option || qq.user_answer || null;
      const timeSpent = userAnsObj?.time_spent || qq.time_spent_seconds || 30;

      const isKeyMatch = Boolean(chosenOptionKey && (chosenOptionKey.trim().toUpperCase() === (q.correct_answer || '').trim().toUpperCase()));
      let isTextMatch = false;
      if (!isKeyMatch && chosenOptionKey) {
        const qOptions = allOptions.filter(o => o.question_id === q.id);
        const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === chosenOptionKey.trim().toUpperCase());
        const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').trim().toUpperCase());
        if (chosenOpt && correctOpt && chosenOpt.option_text && correctOpt.option_text) {
          isTextMatch = chosenOpt.option_text.trim().toLowerCase() === correctOpt.option_text.trim().toLowerCase();
        }
      }
      const isCorr = isKeyMatch || isTextMatch;
      if (isCorr) {
        correctCount++;
        earnedXp += (q.xp_value || 25);
      } else if (chosenOptionKey) {
        earnedXp += 5; // participation effort
      }

      // Update quiz question record
      qq.user_answer = chosenOptionKey;
      qq.is_correct = Boolean(isCorr);
      qq.time_spent_seconds = timeSpent;
      db.update('quizQuestions', qq.id, qq);

      // Save user attempt
      const attemptId = `att-apt-test-${crypto.randomUUID()}`;
      const nowIso = new Date().toISOString();
      db.insert('attempts', {
        id: attemptId,
        user_id: userId,
        question_id: q.id,
        session_id: sessionId,
        chosen_answer: chosenOptionKey,
        user_answer: chosenOptionKey,
        is_correct: Boolean(isCorr),
        time_spent_seconds: timeSpent,
        xp_awarded: isCorr ? (q.xp_value || 25) : 5,
        xp_gained: isCorr ? (q.xp_value || 25) : 5,
        attempted_at: nowIso,
        created_at: nowIso
      });

      // Track in Mistake Vault
      try {
        const mvId = `mv-${userId}-${q.id}`;
        const existingMv = db.get('mistakeVault', mvId);
        const nowIso = new Date().toISOString();
        if (!isCorr) {
          if (existingMv) {
            db.update('mistakeVault', mvId, {
              last_attempt_id: attemptId,
              last_chosen_answer: chosenOptionKey,
              mistake_count: (existingMv.mistake_count || 1) + 1,
              mastery_status: 'unresolved',
              updated_at: nowIso
            });
          } else {
            db.insert('mistakeVault', {
              id: mvId,
              user_id: userId,
              question_id: q.id,
              source_type: 'aptitude',
              last_attempt_id: attemptId,
              last_chosen_answer: chosenOptionKey,
              mistake_count: 1,
              mastery_status: 'unresolved',
              mastered_at: null,
              created_at: nowIso,
              updated_at: nowIso
            });
          }
        } else if (existingMv && existingMv.mastery_status === 'unresolved') {
          db.update('mistakeVault', mvId, {
            last_attempt_id: attemptId,
            last_chosen_answer: chosenOptionKey,
            mastery_status: 'mastered',
            mastered_at: nowIso,
            updated_at: nowIso
          });
        }
      } catch (mvErr) {
        console.warn('[MistakeVault Error in Aptitude Test]:', mvErr.message);
      }

      const qOpts = allOptions.filter(o => o.question_id === q.id);
      const chosenOpt = qOpts.find(o => (o.option_key || '').toUpperCase() === (chosenOptionKey || '').toUpperCase());
      const correctOpt = qOpts.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());

      graded.push({
        question_id: q.id,
        question: q.question,
        chosen_answer: chosenOptionKey,
        chosen_text: chosenOpt?.option_text || (chosenOptionKey ? `Option ${chosenOptionKey}` : 'Unanswered'),
        correct_answer: q.correct_answer,
        correct_text: correctOpt?.option_text || q.correct_answer,
        is_correct: Boolean(isCorr),
        explanation: q.explanation || `Option (${q.correct_answer}) is the correct answer.`,
        difficulty: q.difficulty,
        options: qOpts.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text,
          is_correct: (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase(),
          explanation: o.explanation || ''
        }))
      });
    }

    const accuracyRate = sessionQuestions.length > 0
      ? Math.round((correctCount / sessionQuestions.length) * 100)
      : 0;

    session.status = 'COMPLETED';
    session.correct_count = correctCount;
    session.score = accuracyRate;
    session.xp_earned = earnedXp;
    session.time_taken_seconds = total_time_taken;
    session.completed_at = new Date().toISOString();
    db.update('quizSessions', sessionId, session);

    // Update user profile XP and streak
    const user = db.get('users', userId);
    let finalXp = user?.total_xp || 0;
    if (user) {
      finalXp += earnedXp;
      user.total_xp = finalXp;
      user.current_level = Math.floor(finalXp / 250) + 1;
      db.update('users', userId, user);

      db.insert('xpHistory', {
        id: `xp-${crypto.randomUUID()}`,
        user_id: userId,
        amount: earnedXp,
        reason: `Completed Aptitude Test (${accuracyRate}% score)`,
        created_at: new Date().toISOString()
      });
    }

    return res.json({
      success: true,
      result: {
        session_id: sessionId,
        status: 'COMPLETED',
        total_questions: sessionQuestions.length,
        correct_count: correctCount,
        incorrect_count: sessionQuestions.length - correctCount,
        accuracy_rate: accuracyRate,
        xp_earned: earnedXp,
        total_xp: finalXp,
        time_taken_seconds: total_time_taken,
        graded_questions: graded
      }
    });
  } catch (err) {
    console.error('[Aptitude Submit Session Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit aptitude assessment.' });
  }
});

// 6. GET /api/aptitude/formulas (Interactive Speed-Math & Aptitude Cheat Sheets)
router.get('/formulas', (req, res) => {
  return res.json({
    success: true,
    cheat_sheets: FORMULA_CHEAT_SHEETS
  });
});

export default router;
