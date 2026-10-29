import express from 'express';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';
import { calculatePlacementReadiness } from '../services/placementReadinessService.js';

const router = express.Router();

// GET /api/analytics
router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = db.find('attempts', a => a.user_id === userId);
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
    allCompanies.forEach(c => companyMap.set(c.id, { id: c.id, name: c.name, attempted: 0, correct: 0, total_available: 0 }));

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

    // Sort company practice with attempted companies first, then by available count
    const companyAccuracy = Array.from(companyMap.values())
      .filter(c => c.total_available > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        attempted: c.attempted,
        correct: c.correct,
        available: c.total_available,
        accuracy: c.attempted > 0 ? Math.round((c.correct / c.attempted) * 100) : null
      }))
      .sort((a, b) => {
        if (b.attempted !== a.attempted) return b.attempted - a.attempted;
        return (b.accuracy || 0) - (a.accuracy || 0);
      });

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
    const sortedAttempts = [...attempts].sort((a, b) => {
      const ta = new Date(a.attempted_at || a.created_at || 0).getTime();
      const tb = new Date(b.attempted_at || b.created_at || 0).getTime();
      return ta - tb;
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayAttempts = attempts.filter(a => {
        const ts = a.attempted_at || a.created_at;
        return ts && ts.startsWith(dateString);
      });
      const dayCorrect = dayAttempts.filter(a => a.is_correct).length;
      const dayAccuracy = dayAttempts.length > 0 
        ? Math.round((dayCorrect / dayAttempts.length) * 100) 
        : null;

      const cutoffTime = new Date(`${dateString}T23:59:59.999Z`).getTime();
      const attemptsUpToDay = sortedAttempts.filter(a => {
        const ts = new Date(a.attempted_at || a.created_at || 0).getTime();
        return ts <= cutoffTime;
      });
      const correctUpToDay = attemptsUpToDay.filter(a => a.is_correct).length;
      const cumulativeAccuracy = attemptsUpToDay.length > 0 
        ? Math.round((correctUpToDay / attemptsUpToDay.length) * 100) 
        : overallAccuracy;

      weeklyProgress.push({
        date: dateString,
        day: dayLabel,
        questionsAttempted: dayAttempts.length,
        correctCount: dayCorrect,
        accuracy: dayAccuracy !== null ? dayAccuracy : cumulativeAccuracy,
        dailyAccuracy: dayAccuracy,
        cumulativeAccuracy: cumulativeAccuracy,
        hasActivity: dayAttempts.length > 0
      });
    }

    // Dynamic Topic Performance computed directly from all user attempts
    const topicPerfMap = new Map();
    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (!q) return;
      const topicId = q.topic_id || 'unknown';
      if (!topicPerfMap.has(topicId)) {
        const top = allTopics.find(t => t.id === topicId);
        const sub = allSubjects.find(s => s.id === q.subject_id);
        topicPerfMap.set(topicId, {
          topic_id: topicId,
          subject_id: q.subject_id,
          topic: top?.name || 'Topic',
          subject: sub?.name || 'Core',
          attempted: 0,
          correct: 0
        });
      }
      const item = topicPerfMap.get(topicId);
      item.attempted += 1;
      if (a.is_correct) item.correct += 1;
    });

    const dynamicTopicList = Array.from(topicPerfMap.values()).map(t => {
      const acc = Math.round((t.correct / t.attempted) * 100);
      const weakness = Number(((t.attempted - t.correct) / t.attempted).toFixed(2));
      return {
        topic: t.topic,
        subject: t.subject,
        topic_id: t.topic_id,
        subject_id: t.subject_id,
        attempted: t.attempted,
        correct: t.correct,
        accuracy: acc,
        weakness: weakness,
        strength: Number((1.0 - weakness).toFixed(2))
      };
    });

    // Keep studentPerformance in DB safely synced with live attempts without removing existing data
    try {
      dynamicTopicList.forEach(t => {
        if (t.topic_id && t.topic_id !== 'unknown') {
          const existing = db.findOne('studentPerformance', p => p.user_id === userId && p.topic_id === t.topic_id);
          if (existing) {
            db.update('studentPerformance', existing.id, {
              accuracy_rate: t.accuracy,
              weakness_score: t.weakness,
              total_attempts: t.attempted,
              correct_answers: t.correct,
              updated_at: new Date().toISOString()
            });
          } else {
            db.insert('studentPerformance', {
              id: `perf-${userId}-${t.topic_id}`,
              user_id: userId,
              topic_id: t.topic_id,
              subject_id: t.subject_id,
              accuracy_rate: t.accuracy,
              weakness_score: t.weakness,
              total_attempts: t.attempted,
              correct_answers: t.correct,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      });
    } catch (syncErr) {
      console.warn('[Analytics Performance Sync Notice]:', syncErr?.message || syncErr);
    }

    const weakList = dynamicTopicList
      .filter(t => t.accuracy < 70)
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.attempted - a.attempted;
      })
      .slice(0, 6);

    const strongList = dynamicTopicList
      .filter(t => t.accuracy >= 70)
      .sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.attempted - a.attempted;
      })
      .slice(0, 6);

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

    // Unified Placement Readiness & Company Eligibility Diagnostics
    const readiness = calculatePlacementReadiness({
      attempts,
      currentStreak: streak?.current_streak || 0,
      codingSubmissions,
      companyAccuracy
    });

    const readinessScore = readiness.score;
    const cohortPercentile = readiness.percentile;
    const tierFit = readiness.tier_fit;
    const companyEligibility = readiness.company_eligibility;
    const hasActivity = readiness.has_activity;

    // Experience Points & Level Sync
    const user = db.get('users', userId);
    const attemptsXp = attempts.reduce((acc, a) => acc + (a.xp_gained || 0), 0);
    const userTotalXp = Math.max(user?.total_xp || 0, attemptsXp);
    const userLevel = Math.floor(userTotalXp / 250) + 1;
    if (user && (user.total_xp !== userTotalXp || user.current_level !== userLevel)) {
      db.update('users', userId, {
        total_xp: userTotalXp,
        current_level: userLevel
      });
    }

    const summaryData = {
      total_attempted: totalAttempted,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      overall_accuracy: overallAccuracy,
      avg_time_per_question: avgTimePerQuestion,
      current_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      total_xp: userTotalXp,
      current_level: userLevel
    };

    const placementData = {
      has_activity: hasActivity,
      score: readinessScore,
      percentile: cohortPercentile,
      tier_fit: tierFit,
      company_eligibility: companyEligibility
    };

    return res.json({
      success: true,
      summary: summaryData,
      placement_readiness: placementData,
      recruiter_benchmark_matrix: companyEligibility,
      analytics: {
        summary: summaryData,
        placement_readiness: placementData,
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
