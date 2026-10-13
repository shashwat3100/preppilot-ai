import express from 'express';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics
router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = db.find('attempts', a => a.user_id === userId);
    const performance = db.find('studentPerformance', p => p.user_id === userId);
    const streak = db.findOne('streaks', s => s.user_id === userId);
    const allQuestions = db.getAll('questions');
    const allSubjects = db.getAll('subjects');
    const allTopics = db.getAll('topics');
    const allCompanies = db.getAll('companies');

    const totalAttempted = attempts.length;
    const correctCount = attempts.filter(a => a.is_correct).length;
    const incorrectCount = totalAttempted - correctCount;
    const overallAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

    // Average time per question
    const totalTime = attempts.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0);
    const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalTime / totalAttempted) : 45;

    // Accuracy by Subject
    const subjectMap = new Map();
    allSubjects.forEach(s => subjectMap.set(s.id, { name: s.name, code: s.code, attempted: 0, correct: 0 }));

    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (q && subjectMap.has(q.subject_id)) {
        const item = subjectMap.get(q.subject_id);
        item.attempted += 1;
        if (a.is_correct) item.correct += 1;
      }
    });

    const subjectAccuracy = Array.from(subjectMap.values())
      .filter(s => s.attempted > 0)
      .map(s => ({
        name: s.code || s.name,
        fullName: s.name,
        attempted: s.attempted,
        accuracy: Math.round((s.correct / s.attempted) * 100)
      }));

    // Accuracy by Topic
    const topicMap = new Map();
    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (q) {
        if (!topicMap.has(q.topic_id)) {
          const top = allTopics.find(t => t.id === q.topic_id);
          topicMap.set(q.topic_id, { name: top?.name || 'Topic', attempted: 0, correct: 0 });
        }
        const item = topicMap.get(q.topic_id);
        item.attempted += 1;
        if (a.is_correct) item.correct += 1;
      }
    });

    const topicAccuracy = Array.from(topicMap.values()).map(t => ({
      name: t.name,
      attempted: t.attempted,
      accuracy: Math.round((t.correct / t.attempted) * 100)
    }));

    // Accuracy by Company
    const companyMap = new Map();
    allCompanies.forEach(c => companyMap.set(c.id, { name: c.name, attempted: 0, correct: 0, total_available: 0 }));

    allQuestions.forEach(q => {
      if (q.company_id && companyMap.has(q.company_id)) {
        companyMap.get(q.company_id).total_available += 1;
      }
    });

    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (q && q.company_id && companyMap.has(q.company_id)) {
        const item = companyMap.get(q.company_id);
        item.attempted += 1;
        if (a.is_correct) item.correct += 1;
      }
    });

    const companyAccuracy = Array.from(companyMap.values())
      .filter(c => c.total_available > 0)
      .map(c => ({
        name: c.name,
        attempted: c.attempted,
        available: c.total_available,
        accuracy: c.attempted > 0 ? Math.round((c.correct / c.attempted) * 100) : 0
      }));

    // Accuracy by Difficulty
    const difficultyAccuracy = [
      { difficulty: 'Easy', attempted: 0, correct: 0, accuracy: 0 },
      { difficulty: 'Medium', attempted: 0, correct: 0, accuracy: 0 },
      { difficulty: 'Hard', attempted: 0, correct: 0, accuracy: 0 }
    ];

    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (q) {
        const target = difficultyAccuracy.find(d => d.difficulty === q.difficulty);
        if (target) {
          target.attempted += 1;
          if (a.is_correct) target.correct += 1;
        }
      }
    });

    difficultyAccuracy.forEach(d => {
      d.accuracy = d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0;
    });

    // Weekly Trend (Past 7 days)
    const weeklyProgress = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayAttempts = attempts.filter(a => a.attempted_at && a.attempted_at.startsWith(dateString));
      const dayCorrect = dayAttempts.filter(a => a.is_correct).length;

      weeklyProgress.push({
        date: dateString,
        day: dayLabel,
        questionsAttempted: dayAttempts.length,
        accuracy: dayAttempts.length > 0 ? Math.round((dayCorrect / dayAttempts.length) * 100) : 0
      });
    }

    // Weakest & Strongest Topics
    const weakList = performance
      .filter(p => p.weakness_score >= 0.5)
      .map(p => {
        const top = allTopics.find(t => t.id === p.topic_id);
        const sub = allSubjects.find(s => s.id === p.subject_id);
        return {
          topic: top?.name || 'Concept',
          subject: sub?.name || 'Core',
          accuracy: Math.round(p.accuracy_rate),
          weakness: p.weakness_score
        };
      })
      .sort((a, b) => b.weakness - a.weakness);

    const strongList = performance
      .filter(p => p.weakness_score < 0.5)
      .map(p => {
        const top = allTopics.find(t => t.id === p.topic_id);
        const sub = allSubjects.find(s => s.id === p.subject_id);
        return {
          topic: top?.name || 'Concept',
          subject: sub?.name || 'Core',
          accuracy: Math.round(p.accuracy_rate),
          strength: 1.0 - p.weakness_score
        };
      })
      .sort((a, b) => b.strength - a.strength);

    // Coding Arena Analytics
    const codingSubmissions = db.find('codingSubmissions', s => s.user_id === userId) || [];
    const allCodingProblems = db.getAll('codingProblems') || [];

    const totalSubmissions = codingSubmissions.length;
    const acceptedSubmissions = codingSubmissions.filter(s => s.status === 'ACCEPTED').length;
    const codingAcceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const solvedProblemIds = new Set(codingSubmissions.filter(s => s.status === 'ACCEPTED').map(s => s.problem_id));
    const attemptedProblemIds = new Set(codingSubmissions.map(s => s.problem_id));

    const languageBreakdown = {};
    codingSubmissions.forEach(s => {
      const lang = s.language || 'unknown';
      languageBreakdown[lang] = (languageBreakdown[lang] || 0) + 1;
    });

    const difficultyBreakdown = {
      Easy: { solved: 0, total: allCodingProblems.filter(p => p.difficulty === 'Easy').length },
      Medium: { solved: 0, total: allCodingProblems.filter(p => p.difficulty === 'Medium').length },
      Hard: { solved: 0, total: allCodingProblems.filter(p => p.difficulty === 'Hard').length }
    };

    solvedProblemIds.forEach(id => {
      const prob = allCodingProblems.find(p => p.id === id);
      if (prob && difficultyBreakdown[prob.difficulty]) {
        difficultyBreakdown[prob.difficulty].solved += 1;
      }
    });

    const problemAttemptsMap = new Map();
    codingSubmissions.forEach(s => {
      if (!problemAttemptsMap.has(s.problem_id)) {
        problemAttemptsMap.set(s.problem_id, []);
      }
      problemAttemptsMap.get(s.problem_id).push(s);
    });

    const revisionRecommendations = [];
    problemAttemptsMap.forEach((subs, probId) => {
      const isSolved = subs.some(s => s.status === 'ACCEPTED');
      const prob = allCodingProblems.find(p => p.id === probId);
      if (prob) {
        if (!isSolved) {
          revisionRecommendations.push({
            problem_id: prob.id,
            title: prob.title,
            difficulty: prob.difficulty,
            attempts_count: subs.length,
            last_status: subs[subs.length - 1].status,
            reason: `Attempted ${subs.length} time${subs.length > 1 ? 's' : ''} without passing all test cases.`
          });
        } else if (subs.length >= 3) {
          revisionRecommendations.push({
            problem_id: prob.id,
            title: prob.title,
            difficulty: prob.difficulty,
            attempts_count: subs.length,
            last_status: 'ACCEPTED',
            reason: `Required ${subs.length} attempts to pass; review time & space complexity for optimal pattern.`
          });
        }
      }
    });

    return res.json({
      success: true,
      analytics: {
        summary: {
          total_attempted: totalAttempted,
          correct_answers: correctCount,
          incorrect_answers: incorrectCount,
          overall_accuracy: overallAccuracy,
          avg_time_per_question: avgTimePerQuestion,
          current_streak: streak?.current_streak || 0,
          longest_streak: streak?.longest_streak || 0
        },
        subject_accuracy: subjectAccuracy,
        topic_accuracy: topicAccuracy,
        company_accuracy: companyAccuracy,
        difficulty_accuracy: difficultyAccuracy,
        weekly_progress: weeklyProgress,
        weakest_topics: weakList,
        strongest_topics: strongList,
        coding: {
          total_submissions: totalSubmissions,
          accepted_submissions: acceptedSubmissions,
          problems_solved: solvedProblemIds.size,
          problems_attempted: attemptedProblemIds.size,
          acceptance_rate: codingAcceptanceRate,
          language_breakdown: languageBreakdown,
          difficulty_breakdown: difficultyBreakdown,
          revision_recommendations: revisionRecommendations
        }
      }
    });
  } catch (err) {
    console.error('[Analytics Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error compiling performance analytics.' });
  }
});

export default router;
