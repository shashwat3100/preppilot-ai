import express from 'express';
import { authenticate } from '../middleware/auth.js';
import QuizEngine from '../services/quizEngine.js';
import RecommendationEngine from '../services/recommendationEngine.js';
import db from '../database/db.js';

const router = express.Router();

// POST /api/quiz/adaptive-daily
router.post('/adaptive-daily', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const { count = 5 } = req.body;
    const quiz = QuizEngine.generateAdaptiveDailyQuiz(userId, count);
    return res.json({ success: true, quiz });
  } catch (err) {
    console.error('[Adaptive Quiz Error]:', err);
    return res.status(400).json({ success: false, message: err.message || 'Error generating adaptive daily quiz.' });
  }
});

// GET /api/quiz/assessments (Catalog with live counts)
router.get('/assessments', authenticate, (req, res) => {
  try {
    const catalog = QuizEngine.getAssessmentCatalog();
    return res.json({ success: true, assessments: catalog });
  } catch (err) {
    console.error('[Assessment Catalog Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to load assessment catalog.' });
  }
});

// POST /api/quiz/assessments/:type/start (Starts timed assessment with exact question quota)
router.post('/assessments/:type/start', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const assessmentType = req.params.type;
    const assessment = QuizEngine.generateAssessment(userId, assessmentType);
    return res.json({ success: true, assessment });
  } catch (err) {
    console.error('[Start Assessment Error]:', err);
    return res.status(400).json({ success: false, message: err.message || 'Failed to initialize assessment.' });
  }
});

// POST /api/quiz/custom
router.post('/custom', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const filters = req.body;
    const quiz = QuizEngine.generateCustomQuiz(userId, filters);
    return res.json({ success: true, quiz });
  } catch (err) {
    console.error('[Custom Quiz Error]:', err);
    return res.status(400).json({ success: false, message: err.message || 'Error generating custom quiz.' });
  }
});

// POST /api/quiz/:id/submit
router.post('/:id/submit', authenticate, (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;
    const { answers = [], total_time_taken = 0 } = req.body;

    const result = QuizEngine.submitQuiz(sessionId, userId, answers, total_time_taken);
    return res.json({ success: true, result });
  } catch (err) {
    console.error('[Submit Quiz Error]:', err);
    return res.status(400).json({ success: false, message: err.message || 'Error grading quiz submission.' });
  }
});

// GET /api/quiz/session/:id
router.get('/session/:id', authenticate, (req, res) => {
  const session = db.get('quizSessions', req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Quiz session not found.' });
  }
  return res.json({ success: true, session });
});

// GET /api/quiz/recommendations
router.get('/recommendations', authenticate, (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      branch_id: req.query.branch_id,
      company_id: req.query.company_id,
      subject_id: req.query.subject_id,
      difficulty: req.query.difficulty
    };

    const recommendations = RecommendationEngine.getRecommendations(userId, limit, filters);
    return res.json({ success: true, recommendations });
  } catch (err) {
    console.error('[Recommendations Error]:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving recommendations.' });
  }
});

export default router;
