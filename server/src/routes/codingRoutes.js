import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';
import { runCode, runTestCases, getSupportedLanguages } from '../services/codeExecutionService.js';

const router = express.Router();

// Supported languages
router.get('/languages', authenticate, (req, res) => {
  res.json({ languages: getSupportedLanguages() });
});

// User bookmarks
router.get('/bookmarks', authenticate, (req, res) => {
  const bookmarks = db.find('codingBookmarks', b => b.user_id === req.user.id);
  res.json({ bookmarks: bookmarks.map(b => b.problem_id) });
});

// Toggle bookmark for a problem
router.post('/problems/:id/bookmark', authenticate, (req, res) => {
  const existing = db.find('codingBookmarks', b => b.user_id === req.user.id && b.problem_id === req.params.id);
  if (existing.length > 0) {
    existing.forEach(b => db.delete('codingBookmarks', b.id));
    return res.json({ isBookmarked: false });
  } else {
    db.insert('codingBookmarks', {
      id: uuidv4(),
      user_id: req.user.id,
      problem_id: req.params.id,
      created_at: new Date().toISOString()
    });
    return res.json({ isBookmarked: true });
  }
});

// List problems with filtering, search, stats & bookmarks
router.get('/problems', authenticate, (req, res) => {
  const { branch_id, company_id, subject_id, difficulty, search, tag, bookmarked } = req.query;
  let problems = db.getAll('codingProblems');

  if (branch_id) problems = problems.filter(p => p.branch_id === branch_id);
  if (company_id) problems = problems.filter(p => p.company_id === company_id);
  if (subject_id) problems = problems.filter(p => p.subject_id === subject_id);
  if (difficulty) problems = problems.filter(p => p.difficulty === difficulty);
  if (tag) {
    problems = problems.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }
  if (search) {
    const term = search.toLowerCase();
    problems = problems.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
    );
  }

  const userBookmarks = db.find('codingBookmarks', b => b.user_id === req.user.id);
  const bookmarkSet = new Set(userBookmarks.map(b => b.problem_id));

  if (bookmarked === 'true') {
    problems = problems.filter(p => bookmarkSet.has(p.id));
  }

  const problemsWithStats = problems.map(p => {
    const userSubmissions = db.find('codingSubmissions', s => s.problem_id === p.id && s.user_id === req.user.id);
    const solved = userSubmissions.some(s => s.status === 'ACCEPTED');
    const attempts = userSubmissions.length;

    const allProblemSubmissions = db.find('codingSubmissions', s => s.problem_id === p.id);
    const totalAccepted = allProblemSubmissions.filter(s => s.status === 'ACCEPTED').length;
    const acceptanceRate = allProblemSubmissions.length > 0
      ? Math.round((totalAccepted / allProblemSubmissions.length) * 100)
      : null;

    return {
      ...p,
      solved,
      attempts,
      isBookmarked: bookmarkSet.has(p.id),
      testCaseCount: db.find('codingTestCases', tc => tc.problem_id === p.id).length,
      totalSubmissions: allProblemSubmissions.length,
      acceptanceRate
    };
  });

  res.json({ problems: problemsWithStats });
});

// Single problem details (SECURE: hidden test cases are strictly filtered out)
router.get('/problems/:id', authenticate, (req, res) => {
  const problem = db.get('codingProblems', req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  // STRICT SECURITY: Only non-hidden sample test cases are returned to the client
  const sampleTestCases = db.find('codingTestCases', tc => tc.problem_id === problem.id && !tc.isHidden);
  const userSubmissions = db.find('codingSubmissions', s => s.problem_id === problem.id && s.user_id === req.user.id);
  const isBookmarked = db.find('codingBookmarks', b => b.user_id === req.user.id && b.problem_id === problem.id).length > 0;

  userSubmissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  res.json({
    problem,
    sampleTestCases,
    userSubmissions,
    isBookmarked
  });
});

// Create problem (Admin only)
router.post('/problems', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const { title, description, difficulty, branch_id, company_id, subject_id, topic_id, tags, constraints, starterCode, hints, editorial, timeLimit, memoryLimit } = req.body;

  const problem = {
    id: uuidv4(),
    title,
    description,
    difficulty,
    branch_id,
    company_id,
    subject_id,
    topic_id,
    tags: tags || [],
    constraints: constraints || '',
    starterCode: starterCode || {},
    hints: hints || [],
    editorial: editorial || null,
    timeLimit: timeLimit || 2000,
    memoryLimit: memoryLimit || 256,
    created_by: req.user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.insert('codingProblems', problem);
  res.status(201).json({ problem });
});

// Update problem (Admin only)
router.put('/problems/:id', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const problem = db.update('codingProblems', req.params.id, { ...req.body, updated_at: new Date().toISOString() });
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json({ problem });
});

// Delete problem (Admin only)
router.delete('/problems/:id', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  db.delete('codingTestCases', { problem_id: req.params.id });
  db.delete('codingSubmissions', { problem_id: req.params.id });
  db.delete('codingBookmarks', { problem_id: req.params.id });
  const deleted = db.delete('codingProblems', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Problem not found' });
  res.json({ success: true });
});

// Add test case (Admin only)
router.post('/problems/:id/testcases', authenticate, (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });

  const { input, expectedOutput, isHidden, explanation } = req.body;
  const testCase = {
    id: uuidv4(),
    problem_id: req.params.id,
    input,
    expectedOutput,
    isHidden: isHidden || false,
    explanation: explanation || '',
    created_at: new Date().toISOString()
  };
  db.insert('codingTestCases', testCase);
  res.status(201).json({ testCase });
});

// Run arbitrary code with sample or custom input
router.post('/run', authenticate, async (req, res) => {
  const { code, language, input } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'Code and language required' });

  const result = await runCode(code, language, input || '');
  res.json(result);
});

// Submit code against all test cases (both public and hidden)
router.post('/submit', authenticate, async (req, res) => {
  const { problemId, code, language } = req.body;
  if (!problemId || !code || !language) return res.status(400).json({ error: 'Missing required fields' });

  const problem = db.get('codingProblems', problemId);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const allTestCases = db.find('codingTestCases', tc => tc.problem_id === problemId);
  if (allTestCases.length === 0) return res.status(400).json({ error: 'No test cases configured for this problem' });

  const { results, allPassed, passedCount, totalCount, totalExecutionTimeMs } = await runTestCases(code, language, allTestCases);

  let status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
  const hasRuntimeError = results.some(r => r.error && !r.timedOut && !r.compileError);
  const hasTLE = results.some(r => r.timedOut);
  const hasCompileError = results.some(r => r.compileError);

  if (hasCompileError) status = 'COMPILATION_ERROR';
  else if (hasTLE) status = 'TIME_LIMIT_EXCEEDED';
  else if (hasRuntimeError) status = 'RUNTIME_ERROR';

  const submission = {
    id: uuidv4(),
    user_id: req.user.id,
    problem_id: problemId,
    code,
    language,
    status,
    results,
    passed_count: passedCount,
    total_count: totalCount,
    execution_time: totalExecutionTimeMs,
    memory_used: 0,
    submitted_at: new Date().toISOString()
  };

  db.insert('codingSubmissions', submission);

  if (allPassed) {
    const xpGain = problem.difficulty === 'Easy' ? 50 : problem.difficulty === 'Medium' ? 100 : 150;
    const user = db.get('users', req.user.id);
    if (user) {
      db.update('users', req.user.id, {
        total_xp: (user.total_xp || 0) + xpGain,
        last_active_date: new Date().toISOString().split('T')[0]
      });
      db.insert('xpHistory', {
        id: uuidv4(),
        user_id: req.user.id,
        amount: xpGain,
        action_type: 'CODING_PROBLEM_SOLVED',
        created_at: new Date().toISOString()
      });
    }
  }

  res.json({
    submission,
    allPassed,
    passedCount,
    totalCount,
    status,
    executionTimeMs: totalExecutionTimeMs
  });
});

// Submissions list
router.get('/submissions', authenticate, (req, res) => {
  const { problem_id } = req.query;
  let submissions = db.find('codingSubmissions', s => s.user_id === req.user.id);
  if (problem_id) submissions = submissions.filter(s => s.problem_id === problem_id);
  submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  res.json({ submissions });
});

// Single submission details
router.get('/submissions/:id', authenticate, (req, res) => {
  const submission = db.get('codingSubmissions', req.params.id);
  if (!submission || submission.user_id !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json({ submission });
});

// Coding statistics
router.get('/stats', authenticate, (req, res) => {
  const submissions = db.find('codingSubmissions', s => s.user_id === req.user.id);
  const solved = submissions.filter(s => s.status === 'ACCEPTED');
  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  const byLanguage = {};

  for (const sub of solved) {
    const prob = db.get('codingProblems', sub.problem_id);
    if (prob) byDifficulty[prob.difficulty] = (byDifficulty[prob.difficulty] || 0) + 1;
    byLanguage[sub.language] = (byLanguage[sub.language] || 0) + 1;
  }

  res.json({
    totalSubmissions: submissions.length,
    acceptedSubmissions: solved.length,
    uniqueProblemsSolved: new Set(solved.map(s => s.problem_id)).size,
    byDifficulty,
    byLanguage,
    acceptanceRate: submissions.length ? ((solved.length / submissions.length) * 100).toFixed(1) : 0
  });
});

// ====================================================================
// TIMED CODING ASSESSMENTS
// ====================================================================

// List all coding assessments
router.get('/assessments', authenticate, (req, res) => {
  const assessments = db.getAll('codingAssessments');
  const userAttempts = db.find('codingAssessmentAttempts', a => a.user_id === req.user.id);

  const list = assessments.map(asmt => {
    const attempts = userAttempts.filter(a => a.assessment_id === asmt.id);
    const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
    const latestAttempt = attempts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
    const bestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.map(a => a.score || 0))
      : null;

    return {
      ...asmt,
      problemCount: (asmt.problem_ids || []).length,
      latestAttempt,
      bestScore,
      completed: completedAttempts.length > 0
    };
  });

  res.json({ assessments: list });
});

// Get assessment details and problems (SECURE: hides test cases)
router.get('/assessments/:id', authenticate, (req, res) => {
  const assessment = db.get('codingAssessments', req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const problems = (assessment.problem_ids || []).map(pid => {
    const p = db.get('codingProblems', pid);
    if (!p) return null;
    const sampleTestCases = db.find('codingTestCases', tc => tc.problem_id === pid && !tc.isHidden);
    return {
      ...p,
      sampleTestCases
    };
  }).filter(Boolean);

  const activeAttempt = db.find('codingAssessmentAttempts', a =>
    a.assessment_id === assessment.id &&
    a.user_id === req.user.id &&
    a.status === 'IN_PROGRESS'
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  res.json({ assessment, problems, activeAttempt });
});

// Start a timed assessment session (idempotent / persists across refresh)
router.post('/assessments/:id/start', authenticate, (req, res) => {
  const assessment = db.get('codingAssessments', req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const now = new Date();
  const existingAttempts = db.find('codingAssessmentAttempts', a =>
    a.assessment_id === assessment.id &&
    a.user_id === req.user.id &&
    a.status === 'IN_PROGRESS'
  );

  for (const att of existingAttempts) {
    const startTime = new Date(att.start_time);
    const expiryTime = new Date(startTime.getTime() + (att.duration_minutes * 60 * 1000) + 60000); // 1 min grace
    if (now < expiryTime) {
      return res.json({ attempt: att, isResumed: true });
    } else {
      db.update('codingAssessmentAttempts', att.id, { status: 'TIMED_OUT' });
    }
  }

  const attempt = {
    id: uuidv4(),
    assessment_id: assessment.id,
    user_id: req.user.id,
    start_time: now.toISOString(),
    duration_minutes: assessment.duration_minutes || 45,
    status: 'IN_PROGRESS',
    answers: {},
    created_at: now.toISOString()
  };

  db.insert('codingAssessmentAttempts', attempt);
  res.status(201).json({ attempt, isResumed: false });
});

// Submit timed assessment
router.post('/assessments/:id/submit', authenticate, async (req, res) => {
  const { attemptId, answers } = req.body;
  const assessment = db.get('codingAssessments', req.params.id);
  if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

  const attempt = db.get('codingAssessmentAttempts', attemptId);
  if (!attempt || attempt.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Assessment attempt not found' });
  }

  const problemResults = [];
  let totalScore = 0;
  const pointsPerProblem = Math.floor((assessment.total_marks || 100) / (assessment.problem_ids.length || 1));
  const maxScore = pointsPerProblem * assessment.problem_ids.length;
  const weakTopics = new Set();

  for (const pid of assessment.problem_ids) {
    const problem = db.get('codingProblems', pid);
    const ans = (answers && answers[pid]) || { code: '', language: 'python' };
    const testCases = db.find('codingTestCases', tc => tc.problem_id === pid);

    let probResult = {
      problem_id: pid,
      title: problem ? problem.title : 'Problem',
      difficulty: problem ? problem.difficulty : 'Medium',
      language: ans.language || 'python',
      code: ans.code || '',
      allPassed: false,
      passedCount: 0,
      totalCount: testCases.length,
      score: 0,
      verdict: 'NO_SUBMISSION',
      testResults: []
    };

    if (ans.code && ans.code.trim() && testCases.length > 0) {
      const evalRes = await runTestCases(ans.code, ans.language || 'python', testCases);
      const passedRatio = evalRes.totalCount > 0 ? (evalRes.passedCount / evalRes.totalCount) : 0;
      const problemScore = Math.round(passedRatio * pointsPerProblem);
      totalScore += problemScore;

      let verdict = evalRes.allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
      if (evalRes.results.some(r => r.timedOut)) verdict = 'TIME_LIMIT_EXCEEDED';
      else if (evalRes.results.some(r => r.compileError)) verdict = 'COMPILATION_ERROR';
      else if (evalRes.results.some(r => r.error && !r.timedOut)) verdict = 'RUNTIME_ERROR';

      probResult = {
        ...probResult,
        allPassed: evalRes.allPassed,
        passedCount: evalRes.passedCount,
        totalCount: evalRes.totalCount,
        score: problemScore,
        verdict,
        testResults: evalRes.results
      };

      if (!evalRes.allPassed && problem && problem.tags) {
        problem.tags.forEach(t => weakTopics.add(t));
      }

      // Log to codingSubmissions for user history
      const sub = {
        id: uuidv4(),
        user_id: req.user.id,
        problem_id: pid,
        code: ans.code,
        language: ans.language || 'python',
        status: verdict,
        results: evalRes.results,
        passed_count: evalRes.passedCount,
        total_count: evalRes.totalCount,
        execution_time: evalRes.totalExecutionTimeMs || 0,
        memory_used: 0,
        assessment_id: assessment.id,
        submitted_at: new Date().toISOString()
      };
      db.insert('codingSubmissions', sub);
    } else {
      if (problem && problem.tags) {
        problem.tags.forEach(t => weakTopics.add(t));
      }
    }

    problemResults.push(probResult);
  }

  // Recommendations based on weak topics
  const recommendations = Array.from(weakTopics).slice(0, 3).map(topic => ({
    topic,
    recommendation: `Strengthen your foundational patterns in ${topic}. Focus on edge case handling and asymptotic complexity constraints.`
  }));

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const updatedAttempt = db.update('codingAssessmentAttempts', attemptId, {
    status: 'COMPLETED',
    answers: answers || {},
    results: problemResults,
    score: totalScore,
    max_score: maxScore,
    percentage,
    submitted_at: new Date().toISOString(),
    recommendations
  });

  // Reward XP
  if (totalScore > 0) {
    const user = db.get('users', req.user.id);
    if (user) {
      db.update('users', req.user.id, {
        total_xp: (user.total_xp || 0) + totalScore,
        last_active_date: new Date().toISOString().split('T')[0]
      });
      db.insert('xpHistory', {
        id: uuidv4(),
        user_id: req.user.id,
        amount: totalScore,
        action_type: 'CODING_ASSESSMENT_COMPLETED',
        created_at: new Date().toISOString()
      });
    }
  }

  res.json({
    attempt: updatedAttempt,
    results: problemResults,
    score: totalScore,
    maxScore,
    percentage,
    recommendations
  });
});

// Single assessment attempt result
router.get('/assessments/:id/attempt/:attemptId', authenticate, (req, res) => {
  const attempt = db.get('codingAssessmentAttempts', req.params.attemptId);
  if (!attempt || attempt.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  res.json({ attempt });
});

export default router;