import express from 'express';
import db from '../database/db.js';
import { authenticate } from '../middleware/auth.js';
import RecommendationEngine from '../services/recommendationEngine.js';

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

    // Preparation Readiness Score (Composite of accuracy, consistency, topics covered, and difficulty)
    const distinctTopicsAttempted = new Set(attempts.map(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      return q?.topic_id;
    })).size;

    const topicCoverageRate = allTopics.length > 0 ? (distinctTopicsAttempted / allTopics.length) * 100 : 0;
    const preparationScore = Math.min(100, Math.round(
      (overallAccuracy * 0.45) +
      (Math.min(user.current_streak, 14) / 14 * 25) +
      (topicCoverageRate * 0.30)
    ));

    // Weak and Strong topics
    const weakTopics = [];
    const strongTopics = [];

    performance.forEach(p => {
      const topic = allTopics.find(t => t.id === p.topic_id);
      const subject = allSubjects.find(s => s.id === p.subject_id);
      const item = {
        topic_id: p.topic_id,
        topic_name: topic?.name || 'General',
        subject_name: subject?.name || 'Core',
        attempts: p.attempts_count,
        accuracy: Math.round(p.accuracy_rate),
        weakness_score: p.weakness_score
      };

      if (p.weakness_score >= 0.5) {
        weakTopics.push(item);
      } else {
        strongTopics.push(item);
      }
    });

    weakTopics.sort((a, b) => b.weakness_score - a.weakness_score);
    strongTopics.sort((a, b) => a.weakness_score - b.weakness_score);

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
        total_questions_attempted: totalQuestionsAttempted,
        accuracy_percentage: overallAccuracy,
        total_xp: user.total_xp || 0,
        current_level: user.current_level || 1,
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
