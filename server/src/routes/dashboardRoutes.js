import express from 'express';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';
import RecommendationEngine from '../services/recommendationEngine.js';
import { calculatePlacementReadiness } from '../services/placementReadinessService.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.get('users', userId);
    const attempts = db.find('attempts', a => a.user_id === userId);
    const performance = db.find('studentPerformance', p => p.user_id === userId);
    const streak = db.findOne('streaks', s => s.user_id === userId);
    const allSubjects = db.getAll('subjects');
    const allTopics = db.getAll('topics');
    const allCompanies = db.getAll('companies');
    const allQuestions = db.getAll('questions');

    const totalQuestionsAttempted = attempts.length;
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const overallAccuracy = totalQuestionsAttempted > 0
      ? Math.round((correctAttempts / totalQuestionsAttempted) * 100)
      : 0;

    // Coding submissions for blended readiness calculation
    const codingSubmissions = db.find('codingSubmissions', s => s.user_id === userId) || [];

    // Unified Canonical Placement Readiness Score (Pillars: Accuracy, Velocity, Volume, Consistency, Coding)
    const currentStreakCount = streak?.current_streak || user?.current_streak || 0;
    const placementReadiness = calculatePlacementReadiness({
      attempts,
      currentStreak: currentStreakCount,
      codingSubmissions
    });
    const preparationScore = placementReadiness.score;

    // Experience Points & Level Sync
    const attemptsXp = attempts.reduce((acc, a) => acc + (a.xp_gained || 0), 0);
    const userTotalXp = Math.max(user.total_xp || 0, attemptsXp);
    const userLevel = Math.floor(userTotalXp / 250) + 1;
    if (user.total_xp !== userTotalXp || user.current_level !== userLevel) {
      db.update('users', userId, {
        total_xp: userTotalXp,
        current_level: userLevel
      });
      user.total_xp = userTotalXp;
      user.current_level = userLevel;
    }

    // Dynamic Topic Performance computed directly from live user attempts (100% synchronized with Analytics)
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
          topic_name: top?.name || 'General',
          subject_name: sub?.name || 'Core',
          attempts: 0,
          correct: 0
        });
      }
      const item = topicPerfMap.get(topicId);
      item.attempts += 1;
      if (a.is_correct) item.correct += 1;
    });

    const weakTopics = [];
    const strongTopics = [];

    topicPerfMap.forEach(item => {
      const acc = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
      const weakness = Number(((item.attempts - item.correct) / item.attempts).toFixed(2));
      const entry = {
        topic_id: item.topic_id,
        topic_name: item.topic_name,
        subject_name: item.subject_name,
        attempts: item.attempts,
        accuracy: acc,
        weakness_score: weakness
      };
      if (acc < 70) {
        weakTopics.push(entry);
      } else {
        strongTopics.push(entry);
      }
    });

    weakTopics.sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.attempts - a.attempts;
    });
    strongTopics.sort((a, b) => {
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.attempts - a.attempts;
    });

    // Subject progress breakdown
    const subjectProgress = allSubjects.map(sub => {
      const subQuestions = allQuestions.filter(q => q.subject_id === sub.id);
      const subAttempts = attempts.filter(a => {
        const q = allQuestions.find(item => item.id === a.question_id);
        return q?.subject_id === sub.id;
      });

      const subCorrect = subAttempts.filter(a => a.is_correct).length;
      const subAccuracy = subAttempts.length > 0 ? Math.round((subCorrect / subAttempts.length) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        icon: sub.icon,
        total_questions: subQuestions.length,
        attempted: subAttempts.length,
        accuracy: subAccuracy
      };
    });

    // Difficulty progression
    const difficultyStats = {
      Easy: { attempted: 0, correct: 0, accuracy: 0 },
      Medium: { attempted: 0, correct: 0, accuracy: 0 },
      Hard: { attempted: 0, correct: 0, accuracy: 0 }
    };

    attempts.forEach(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      if (q && difficultyStats[q.difficulty]) {
        difficultyStats[q.difficulty].attempted += 1;
        if (a.is_correct) difficultyStats[q.difficulty].correct += 1;
      }
    });

    Object.keys(difficultyStats).forEach(diff => {
      const stat = difficultyStats[diff];
      stat.accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
    });

    // Target companies list with details
    const targetCompanyIds = user.target_companies || [];
    const targetCompanies = allCompanies
      .filter(c => targetCompanyIds.includes(c.id))
      .map(c => {
        const compQuestions = allQuestions.filter(q => q.company_id === c.id);
        const compAttempts = attempts.filter(a => {
          const q = allQuestions.find(item => item.id === a.question_id);
          return q?.company_id === c.id;
        });
        const compCorrect = compAttempts.filter(a => a.is_correct).length;
        const compAcc = compAttempts.length > 0 ? Math.round((compCorrect / compAttempts.length) * 100) : 0;

        return {
          id: c.id,
          name: c.name,
          tier: c.tier,
          logo_icon: c.logo_icon,
          question_count: compQuestions.length,
          attempted_count: compAttempts.length,
          accuracy: compAcc
        };
      });

    // Recent attempts with question details
    const recentAttempts = attempts
      .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at))
      .slice(0, 5)
      .map(a => {
        const q = allQuestions.find(item => item.id === a.question_id);
        const topic = allTopics.find(t => t.id === q?.topic_id);
        return {
          id: a.id,
          question_id: a.question_id,
          question_text: q?.question || 'Question',
          topic_name: topic?.name || 'Topic',
          is_correct: a.is_correct,
          xp_gained: a.xp_gained,
          attempted_at: a.attempted_at
        };
      });

    // Recommendations (top 4 for dashboard)
    const recommendations = RecommendationEngine.getRecommendations(userId, 4);

    return res.json({
      success: true,
      stats: {
        preparation_score: preparationScore,
        placement_readiness: placementReadiness,
        total_questions_attempted: totalQuestionsAttempted,
        correct_answers: correctAttempts,
        incorrect_answers: totalQuestionsAttempted - correctAttempts,
        accuracy_percentage: overallAccuracy,
        total_xp: userTotalXp,
        current_level: userLevel,
        current_streak: streak?.current_streak || user.current_streak || 0,
        longest_streak: streak?.longest_streak || user.longest_streak || 0,
        weak_topics: weakTopics.slice(0, 5),
        strong_topics: strongTopics.slice(0, 5),
        recent_attempts: recentAttempts,
        recommended_questions: recommendations,
        target_companies: targetCompanies,
        subject_progress: subjectProgress,
        difficulty_progression: difficultyStats
      }
    });
  } catch (err) {
    console.error('[Dashboard Stats Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving dashboard statistics.' });
  }
});

export default router;
