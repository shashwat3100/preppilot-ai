import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getPostgresAccessStats, isPostgresConfigured } from '../database/postgres.js';

const router = express.Router();

// Require admin authentication for all admin routes
router.use(authenticate, requireAdmin);

// Helper: Calculate relative date string
const getRelativeDateString = (isoDate) => {
  if (!isoDate) return 'Recently';
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// =========================================================================
// 1. OVERVIEW METRICS
// =========================================================================
router.get('/overview', (req, res) => {
  try {
    const users = db.getAll('users');
    const students = users.filter(u => u.role === 'STUDENT');
    const questions = db.getAll('questions');
    const attempts = db.getAll('attempts');
    const sessions = db.getAll('quizSessions');
    const companies = db.getAll('companies');
    const topics = db.getAll('topics');
    const performance = db.getAll('studentPerformance');

    const totalStudents = students.length;

    // Detect new joinees (joined in the last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const newJoinees = students.filter(s => {
      const joinTime = s.created_at ? new Date(s.created_at).getTime() : 0;
      return joinTime >= sevenDaysAgo;
    });

    // Active in last 7 days
    const activeStudents = students.filter(s => {
      if (s.is_blocked || s.status === 'BLOCKED') return false;
      if (!s.last_active_date) return false;
      const days = (Date.now() - new Date(s.last_active_date).getTime()) / (1000 * 3600 * 24);
      return days <= 7;
    });

    // Blocked/suspended count
    const blockedStudents = students.filter(s => s.is_blocked || s.status === 'BLOCKED');

    const totalQuestions = questions.length;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const quizCompletionRate = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 100;

    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const avgAccuracy = attempts.length > 0 ? Math.round((correctAttempts / attempts.length) * 100) : 0;

    // Weakest topics across campus
    const topicWeaknessSum = new Map();
    performance.forEach(p => {
      const current = topicWeaknessSum.get(p.topic_id) || { sum: 0, count: 0 };
      current.sum += (p.weakness_score || 0.5);
      current.count += 1;
      topicWeaknessSum.set(p.topic_id, current);
    });

    const topicRankings = Array.from(topicWeaknessSum.entries()).map(([topicId, stat]) => {
      const top = topics.find(t => t.id === topicId);
      const avgWeakness = stat.count > 0 ? (stat.sum / stat.count) : 0.5;
      return {
        topic_id: topicId,
        topic_name: top?.name || 'Topic',
        avg_weakness: parseFloat(avgWeakness.toFixed(2)),
        student_count: stat.count
      };
    }).sort((a, b) => b.avg_weakness - a.avg_weakness);

    // Most selected companies
    const companyCounts = {};
    students.forEach(s => {
      (s.target_companies || []).forEach(cid => {
        companyCounts[cid] = (companyCounts[cid] || 0) + 1;
      });
    });

    const topCompanies = Object.keys(companyCounts).map(cid => {
      const comp = companies.find(c => c.id === cid);
      return {
        id: cid,
        name: comp?.name || cid,
        student_count: companyCounts[cid]
      };
    }).sort((a, b) => b.student_count - a.student_count);

    const overviewData = {
      total_students: totalStudents,
      new_joinees_count: newJoinees.length,
      active_students: activeStudents.length,
      active_students_7d: activeStudents.length,
      blocked_students: blockedStudents.length,
      total_questions: totalQuestions,
      total_sessions: sessions.length,
      completed_quizzes: completedSessions,
      completed_sessions: completedSessions,
      assessment_completion_rate: quizCompletionRate,
      quiz_completion_rate: quizCompletionRate,
      total_attempts: attempts.length,
      platform_average_accuracy: avgAccuracy,
      total_coding_submissions: (db.getAll('codingSubmissions') || []).length,
      coding_acceptance_rate: (() => {
        const subs = db.getAll('codingSubmissions') || [];
        if (subs.length === 0) return 100;
        const passed = subs.filter(s => s.status === 'ACCEPTED').length;
        return Math.round((passed / subs.length) * 100);
      })(),
      weakest_topics_platform: topicRankings.slice(0, 5),
      most_selected_companies: topCompanies
    };

    return res.json({
      success: true,
      overview: overviewData,
      stats: overviewData
    });
  } catch (err) {
    console.error('[Admin Overview Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving admin metrics.' });
  }
});

// =========================================================================
// 2. ENROLLED STUDENTS MANAGEMENT (Listing, Filter, New Joinee detection)
// =========================================================================
router.get('/students', (req, res) => {
  try {
    const { filter, search, sort } = req.query;
    const users = db.getAll('users');
    const branches = db.getAll('branches');
    const jobRoles = db.getAll('jobRoles');
    const attempts = db.getAll('attempts');

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Filter out automated ephemeral test probe accounts unless explicitly searching
    const isTestProbe = u => /^(concurrent_|blocked_|expire_|student_esc_)/.test(u.email);

    let students = users
      .filter(u => u.role === 'STUDENT' && (!isTestProbe(u) || (search && search.trim())))
      .map(u => {
        const { password_hash, ...safe } = u;
        const branch = branches.find(b => b.id === u.branch_id);
        const role = jobRoles.find(r => r.id === u.preferred_job_role_id);

        // Student attempts & accuracy
        const studentAttempts = attempts.filter(a => a.user_id === u.id);
        const totalAttempted = studentAttempts.length;
        const correctAttempts = studentAttempts.filter(a => a.is_correct).length;
        const accuracy = totalAttempted > 0 ? Math.round((correctAttempts / totalAttempted) * 100) : null;

        // Registration timestamp fallback
        const createdAt = u.created_at || new Date(Date.now() - 3 * 86400000).toISOString();
        const isNewJoinee = new Date(createdAt).getTime() >= sevenDaysAgo;
        const isBlocked = Boolean(u.is_blocked || u.status === 'BLOCKED');

        return {
          ...safe,
          branch_name: branch?.name || 'B.Tech Core',
          branch_code: branch?.code || 'B.Tech',
          job_role_title: role?.title || 'Software Development Engineer',
          total_attempted: totalAttempted,
          total_correct: correctAttempts,
          accuracy: accuracy !== null ? accuracy : 0,
          accuracy_rate: accuracy,
          is_blocked: isBlocked,
          status: isBlocked ? 'BLOCKED' : 'ACTIVE',
          created_at: createdAt,
          is_new_joinee: isNewJoinee,
          joined_relative: getRelativeDateString(createdAt),
          last_active_relative: getRelativeDateString(u.last_active_date)
        };
      });

    // Apply Filter
    if (filter === 'new') {
      students = students.filter(s => s.is_new_joinee);
    } else if (filter === 'blocked') {
      students = students.filter(s => s.is_blocked);
    } else if (filter === 'active') {
      students = students.filter(s => !s.is_blocked);
    }

    // Apply Search
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      students = students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.branch_name && s.branch_name.toLowerCase().includes(q)) ||
        (s.target_companies && s.target_companies.some(c => c.toLowerCase().includes(q)))
      );
    }

    // Apply Sort
    if (sort === 'newest') {
      students.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'xp') {
      students.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0));
    } else if (sort === 'accuracy') {
      students.sort((a, b) => (b.accuracy_rate ?? -1) - (a.accuracy_rate ?? -1));
    } else if (sort === 'name') {
      students.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: Sort by activity (XP & attempts) so active students are prominent
      students.sort((a, b) => {
        const xpDiff = (b.total_xp || 0) - (a.total_xp || 0);
        if (xpDiff !== 0) return xpDiff;
        return (b.total_attempted || 0) - (a.total_attempted || 0);
      });
    }

    return res.json({ success: true, count: students.length, students });
  } catch (err) {
    console.error('[Admin Students Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving student directory.' });
  }
});

// =========================================================================
// 3. DETAILED STUDENT PROGRESS DOSSIER
// =========================================================================
router.get('/students/:id/progress', (req, res) => {
  try {
    const studentId = req.params.id;
    const student = db.get('users', studentId);

    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ success: false, message: 'Student candidate not found.' });
    }

    const { password_hash, ...safeStudent } = student;

    const branches = db.getAll('branches');
    const jobRoles = db.getAll('jobRoles');
    const branch = branches.find(b => b.id === student.branch_id);
    const role = jobRoles.find(r => r.id === student.preferred_job_role_id);

    const attempts = db.find('attempts', a => a.user_id === studentId);
    const sessions = db.find('quizSessions', s => s.user_id === studentId);
    const performance = db.find('studentPerformance', p => p.user_id === studentId);
    const streak = db.findOne('streaks', s => s.user_id === studentId);
    const allQuestions = db.getAll('questions');
    const allSubjects = db.getAll('subjects');
    const allTopics = db.getAll('topics');
    const allCompanies = db.getAll('companies');

    const totalAttempted = attempts.length;
    const correctCount = attempts.filter(a => a.is_correct).length;
    const incorrectCount = totalAttempted - correctCount;
    const overallAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

    // Time calculations
    const totalTimeSpent = attempts.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0);
    const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalTimeSpent / totalAttempted) : 45;

    // Placement Readiness Composite Score (0-100)
    const distinctTopics = new Set(attempts.map(a => {
      const q = allQuestions.find(item => item.id === a.question_id);
      return q?.topic_id;
    })).size;
    const coverageRate = allTopics.length > 0 ? (distinctTopics / allTopics.length) * 100 : 0;
    const readinessScore = Math.min(100, Math.round(
      (overallAccuracy * 0.45) +
      (Math.min(student.current_streak || 1, 14) / 14 * 25) +
      (coverageRate * 0.30)
    ));

    // Subject Breakdown
    const subjectBreakdown = allSubjects.map(sub => {
      const subAttempts = attempts.filter(a => {
        const q = allQuestions.find(item => item.id === a.question_id);
        return q?.subject_id === sub.id;
      });
      const subCorrect = subAttempts.filter(a => a.is_correct).length;
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        attempted: subAttempts.length,
        correct: subCorrect,
        accuracy: subAttempts.length > 0 ? Math.round((subCorrect / subAttempts.length) * 100) : 0
      };
    }).filter(s => s.attempted > 0);

    // Weak & Strong Topics
    const topicStats = [];
    allTopics.forEach(t => {
      const topAttempts = attempts.filter(a => {
        const q = allQuestions.find(item => item.id === a.question_id);
        return q?.topic_id === t.id;
      });
      if (topAttempts.length > 0) {
        const corr = topAttempts.filter(a => a.is_correct).length;
        const acc = Math.round((corr / topAttempts.length) * 100);
        const perf = performance.find(p => p.topic_id === t.id);
        const sub = allSubjects.find(s => s.id === t.subject_id);
        topicStats.push({
          topic_id: t.id,
          topic_name: t.name,
          subject_name: sub?.name || 'Core',
          attempted: topAttempts.length,
          correct: corr,
          accuracy: acc,
          weakness_score: perf?.weakness_score || (1 - (acc / 100))
        });
      }
    });

    const weakTopics = [...topicStats].sort((a, b) => b.weakness_score - a.weakness_score).slice(0, 5);
    const strongTopics = [...topicStats].sort((a, b) => a.weakness_score - b.weakness_score).slice(0, 5);

    // Target Companies Alignment
    const targetCompanyIds = student.target_companies || [];
    const companyAlignment = allCompanies
      .filter(c => targetCompanyIds.includes(c.id))
      .map(c => {
        const compAttempts = attempts.filter(a => {
          const q = allQuestions.find(item => item.id === a.question_id);
          return q?.company_id === c.id;
        });
        const compCorrect = compAttempts.filter(a => a.is_correct).length;
        return {
          id: c.id,
          name: c.name,
          tier: c.tier,
          attempted: compAttempts.length,
          correct: compCorrect,
          accuracy: compAttempts.length > 0 ? Math.round((compCorrect / compAttempts.length) * 100) : 0
        };
      });

    // Recent Quiz Sessions
    const recentSessions = sessions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8)
      .map(s => ({
        id: s.id,
        quiz_type: s.quiz_type,
        status: s.status,
        score: s.score || 0,
        total_questions: s.total_questions || 5,
        time_taken_seconds: s.total_time_taken || 0,
        completed_at: s.completed_at || s.created_at,
        date_formatted: getRelativeDateString(s.completed_at || s.created_at)
      }));

    // Recent Attempts Log with Question and Answers
    const recentAttempts = attempts
      .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime())
      .slice(0, 10)
      .map(a => {
        const q = allQuestions.find(item => item.id === a.question_id);
        const sub = allSubjects.find(s => s.id === q?.subject_id);
        const top = allTopics.find(t => t.id === q?.topic_id);
        return {
          id: a.id,
          question_text: q?.question || 'Technical MCQ',
          difficulty: q?.difficulty || 'Medium',
          subject_name: sub?.name || 'Core',
          topic_name: top?.name || 'Concept',
          user_answer: a.user_answer,
          correct_answer: a.correct_answer,
          is_correct: a.is_correct,
          time_spent_seconds: a.time_spent_seconds || 30,
          attempted_at: a.attempted_at,
          date_formatted: getRelativeDateString(a.attempted_at)
        };
      });

    return res.json({
      success: true,
      progress: {
        student: {
          ...safeStudent,
          branch_name: branch?.name || 'B.Tech Core',
          job_role_title: role?.title || 'Software Development Engineer',
          current_streak: streak?.current_streak || student.current_streak || 1,
          longest_streak: streak?.longest_streak || student.longest_streak || 1,
          is_blocked: Boolean(student.is_blocked || student.status === 'BLOCKED'),
          status: (student.is_blocked || student.status === 'BLOCKED') ? 'BLOCKED' : 'ACTIVE',
          joined_relative: getRelativeDateString(student.created_at),
          last_active_relative: getRelativeDateString(student.last_active_date)
        },
        readiness_score: readinessScore,
        summary: {
          total_attempted: totalAttempted,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          overall_accuracy: overallAccuracy,
          total_time_spent_seconds: totalTimeSpent,
          avg_time_per_question: avgTimePerQuestion
        },
        subject_breakdown: subjectBreakdown,
        weak_topics: weakTopics,
        strong_topics: strongTopics,
        company_alignment: companyAlignment,
        recent_sessions: recentSessions,
        recent_attempts: recentAttempts
      }
    });
  } catch (err) {
    console.error('[Student Progress Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error compiling student progress dossier.' });
  }
});

// =========================================================================
// 4. BLOCK / UNBLOCK STUDENT PROFILE
// =========================================================================
router.patch('/students/:id/status', (req, res) => {
  try {
    const studentId = req.params.id;
    const student = db.get('users', studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    if (student.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot block administrator accounts.' });
    }

    const { is_blocked, reason } = req.body;
    const newBlockedState = is_blocked !== undefined ? Boolean(is_blocked) : !student.is_blocked;

    const updated = db.update('users', studentId, {
      is_blocked: newBlockedState,
      status: newBlockedState ? 'BLOCKED' : 'ACTIVE',
      blocked_at: newBlockedState ? new Date().toISOString() : null,
      blocked_reason: newBlockedState ? (reason || 'Profile suspended by Placement Administrator') : null
    });

    const actionText = newBlockedState ? 'blocked/suspended' : 'unblocked and restored to active';
    return res.json({
      success: true,
      message: `Candidate ${student.name} profile has been ${actionText}.`,
      student: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        is_blocked: updated.is_blocked,
        status: updated.status
      }
    });
  } catch (err) {
    console.error('[Block Student Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error updating student block status.' });
  }
});

// Also support PUT for status updates
router.put('/students/:id/status', (req, res) => {
  return router.handle(req, res);
});

// =========================================================================
// 5. KICK OUT / DELETE STUDENT (Full Purge)
// =========================================================================
router.delete('/students/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const student = db.get('users', studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (student.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Security violation: Cannot delete administrator profile.' });
    }

    const rawStore = db.getStore();

    // 1. Remove from users
    rawStore.users = (rawStore.users || []).filter(u => u.id !== studentId);

    // 2. Cascade remove all linked records
    rawStore.attempts = (rawStore.attempts || []).filter(a => a.user_id !== studentId);
    rawStore.quizSessions = (rawStore.quizSessions || []).filter(s => s.user_id !== studentId);
    rawStore.studentPerformance = (rawStore.studentPerformance || []).filter(p => p.user_id !== studentId);
    rawStore.streaks = (rawStore.streaks || []).filter(s => s.user_id !== studentId);
    rawStore.xpHistory = (rawStore.xpHistory || []).filter(x => x.user_id !== studentId);
    rawStore.userAchievements = (rawStore.userAchievements || []).filter(ua => ua.user_id !== studentId);

    db.setStore(rawStore);

    return res.json({
      success: true,
      message: `Student "${student.name}" (${student.email}) has been permanently kicked out and purged from the placement database.`
    });
  } catch (err) {
    console.error('[Delete Student Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error purging student profile.' });
  }
});

// =========================================================================
// 6. QUESTION BANK MANAGEMENT
// =========================================================================
router.get('/questions', (req, res) => {
  const questions = db.getAll('questions');
  const allOptions = db.getAll('questionOptions');
  const subjects = db.getAll('subjects');
  const topics = db.getAll('topics');
  const companies = db.getAll('companies');

  const fullQuestions = questions.map(q => {
    const subject = subjects.find(s => s.id === q.subject_id);
    const topic = topics.find(t => t.id === q.topic_id);
    const company = companies.find(c => c.id === q.company_id);
    const options = allOptions.filter(o => o.question_id === q.id);
    return {
      ...q,
      subject_name: subject?.name,
      topic_name: topic?.name,
      company_name: company?.name || 'Universal',
      options
    };
  });

  return res.json({ success: true, questions: fullQuestions });
});

router.post('/questions', (req, res) => {
  try {
    const {
      question,
      question_type = 'MCQ',
      branch_id,
      company_id,
      job_role_id,
      subject_id,
      topic_id,
      difficulty = 'Medium',
      correct_answer,
      explanation,
      tags = [],
      expected_time = 60,
      xp_value = 25,
      options = []
    } = req.body;

    if (!question || !subject_id || !topic_id || !correct_answer) {
      return res.status(400).json({ success: false, message: 'Question prompt, subject, topic, and correct answer are required.' });
    }

    const questionId = `q-${crypto.randomUUID()}`;
    const newQuestion = {
      id: questionId,
      question,
      question_type,
      branch_id,
      company_id,
      job_role_id,
      subject_id,
      topic_id,
      difficulty,
      correct_answer,
      explanation,
      tags: Array.isArray(tags) ? tags : [tags],
      expected_time: parseInt(expected_time) || 60,
      xp_value: parseInt(xp_value) || 25,
      created_at: new Date().toISOString()
    };

    db.insert('questions', newQuestion);

    // Save options
    if (options && options.length > 0) {
      options.forEach(opt => {
        db.insert('questionOptions', {
          id: `opt-${questionId}-${opt.option_key}`,
          question_id: questionId,
          option_key: opt.option_key,
          option_text: opt.option_text,
          is_correct: opt.option_key === correct_answer
        });
      });
    }

    return res.status(201).json({ success: true, message: 'Question created successfully in bank.', question: newQuestion });
  } catch (err) {
    console.error('[Create Question Error]:', err);
    return res.status(500).json({ success: false, message: 'Error adding question.' });
  }
});

router.put('/questions/:id', (req, res) => {
  try {
    const questionId = req.params.id;
    const existing = db.get('questions', questionId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Question not found in database.' });
    }

    const {
      question,
      question_type,
      branch_id,
      company_id,
      job_role_id,
      subject_id,
      topic_id,
      difficulty,
      correct_answer,
      explanation,
      tags,
      expected_time,
      xp_value,
      options
    } = req.body;

    const updatedData = {
      ...existing,
      question: question !== undefined ? question : existing.question,
      question_type: question_type || existing.question_type || 'MCQ',
      branch_id: branch_id !== undefined ? branch_id : existing.branch_id,
      company_id: company_id !== undefined ? company_id : existing.company_id,
      job_role_id: job_role_id !== undefined ? job_role_id : existing.job_role_id,
      subject_id: subject_id !== undefined ? subject_id : existing.subject_id,
      topic_id: topic_id !== undefined ? topic_id : existing.topic_id,
      difficulty: difficulty || existing.difficulty || 'Medium',
      correct_answer: correct_answer !== undefined ? correct_answer : existing.correct_answer,
      explanation: explanation !== undefined ? explanation : existing.explanation,
      tags: tags !== undefined ? (Array.isArray(tags) ? tags : [tags]) : existing.tags,
      expected_time: expected_time !== undefined ? parseInt(expected_time) || 60 : existing.expected_time,
      xp_value: xp_value !== undefined ? parseInt(xp_value) || 25 : existing.xp_value,
      updated_at: new Date().toISOString()
    };

    db.update('questions', questionId, updatedData);

    // If options are provided, update options
    if (options && Array.isArray(options) && options.length > 0) {
      const allOpts = db.getAll('questionOptions');
      const toDelete = allOpts.filter(o => o.question_id === questionId);
      toDelete.forEach(o => db.delete('questionOptions', o.id));

      const finalCorrect = updatedData.correct_answer;
      options.forEach(opt => {
        db.insert('questionOptions', {
          id: `opt-${questionId}-${opt.option_key}`,
          question_id: questionId,
          option_key: opt.option_key,
          option_text: opt.option_text,
          is_correct: opt.option_key === finalCorrect
        });
      });
    }

    return res.json({ success: true, message: 'Question updated successfully.', question: updatedData });
  } catch (err) {
    console.error('[Update Question Error]:', err);
    return res.status(500).json({ success: false, message: 'Error updating question.' });
  }
});

router.delete('/questions/:id', (req, res) => {
  const success = db.delete('questions', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Question not found in database.' });
  }
  return res.json({ success: true, message: 'Question deleted successfully.' });
});

// =========================================================================
// 7. PREPPILOT RAG KNOWLEDGE DOCUMENTS MANAGEMENT
// =========================================================================
router.get('/knowledge', (req, res) => {
  const docs = db.getAll('knowledgeDocuments');
  const subjects = db.getAll('subjects');
  const companies = db.getAll('companies');

  const formatted = docs.map(d => ({
    ...d,
    subject_name: subjects.find(s => s.id === d.subject_id)?.name || 'General Engineering',
    company_name: companies.find(c => c.id === d.company_id)?.name || 'All Drives'
  }));

  return res.json({ success: true, documents: formatted });
});

router.post('/knowledge', (req, res) => {
  try {
    const { title, content, summary, category = 'CONCEPT', branch_id, subject_id, company_id, keywords = [] } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Document title and technical content are required.' });
    }

    const docId = `doc-${crypto.randomUUID()}`;
    const newDoc = {
      id: docId,
      title,
      content,
      summary: summary || title,
      category,
      branch_id,
      subject_id,
      company_id,
      keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()),
      created_at: new Date().toISOString()
    };

    db.insert('knowledgeDocuments', newDoc);
    return res.status(201).json({ success: true, message: 'Knowledge document indexed into PrepPilot RAG system.', document: newDoc });
  } catch (err) {
    console.error('[Add Knowledge Error]:', err);
    return res.status(500).json({ success: false, message: 'Error indexing knowledge document.' });
  }
});

router.delete('/knowledge/:id', (req, res) => {
  const success = db.delete('knowledgeDocuments', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Knowledge document not found.' });
  }
  return res.json({ success: true, message: 'Knowledge document removed from RAG engine.' });
});

// =========================================================================
// 8. PLACEMENT DRIVE ANNOUNCEMENTS & ALERTS
// =========================================================================
router.get('/announcements', (req, res) => {
  const announcements = db.getAll('announcements') || [];
  announcements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return res.json({ success: true, announcements });
});

router.post('/announcements', (req, res) => {
  try {
    const { title, message, category = 'DRIVE', priority = 'HIGH', company_name, deadline } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Announcement title and message are required.' });
    }

    const newAnnouncement = {
      id: `ann-${crypto.randomUUID()}`,
      title,
      message,
      category,
      priority,
      company_name: company_name || null,
      deadline: deadline || null,
      created_at: new Date().toISOString(),
      created_by: req.user.name
    };

    db.insert('announcements', newAnnouncement);
    return res.status(201).json({ success: true, message: 'Placement announcement broadcasted to all students.', announcement: newAnnouncement });
  } catch (err) {
    console.error('[Create Announcement Error]:', err);
    return res.status(500).json({ success: false, message: 'Error publishing announcement.' });
  }
});

router.delete('/announcements/:id', (req, res) => {
  const success = db.delete('announcements', req.params.id);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }
  return res.json({ success: true, message: 'Announcement deleted.' });
});

// =========================================================================
// 9. USER & FACULTY MANAGEMENT GOVERNANCE
// =========================================================================
router.get('/faculty', (req, res) => {
  const users = db.getAll('users');
  const faculty = users.filter(u => u.role === 'ADMIN' || u.role === 'DEAN').map(u => {
    const { password_hash, ...safe } = u;
    return {
      ...safe,
      joined_relative: getRelativeDateString(u.created_at)
    };
  });
  return res.json({ success: true, faculty });
});

router.post('/faculty/appoint', async (req, res) => {
  try {
    const { name, email, password, role = 'DEAN', designation, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'User name, institutional email, and password are required.' });
    }

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'DEAN';
    const assignedDesignation = designation || (assignedRole === 'ADMIN' ? 'Administrator' : 'Dean');

    const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.role === assignedRole) {
        return res.status(400).json({ success: false, message: `This member already holds ${assignedRole} credentials.` });
      }
      // Update existing user role
      const updated = db.update('users', existing.id, {
        role: assignedRole,
        designation: assignedDesignation,
        department: department || 'Academic & Placement Governance'
      });
      return res.json({
        success: true,
        message: `${existing.name} successfully updated to ${assignedRole} privileges.`,
        faculty: updated
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-${assignedRole.toLowerCase()}-${crypto.randomUUID()}`;

    const newStaff = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role: assignedRole,
      designation: assignedDesignation,
      department: department || 'Academic & Placement Governance',
      branch_id: 'branch-cse',
      year: assignedRole === 'ADMIN' ? 'Faculty / Admin' : 'Faculty / Dean',
      graduation_year: 2018,
      preferred_job_role_id: 'role-sde',
      target_companies: ['comp-tcs', 'comp-infosys', 'comp-wipro', 'comp-accenture'],
      skill_level: 'Advanced',
      areas_of_interest: ['Campus Placement Drives', 'Assessment Evaluation', 'Curriculum Mapping'],
      total_xp: 2500,
      current_level: 10,
      current_streak: 30,
      longest_streak: 45,
      last_active_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_blocked: false,
      status: 'ACTIVE'
    };

    db.insert('users', newStaff);
    const { password_hash: ph, ...safe } = newStaff;

    return res.status(201).json({
      success: true,
      message: `${name} has been appointed with ${assignedRole} authority!`,
      faculty: safe
    });
  } catch (err) {
    console.error('[Appoint Faculty Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error appointing faculty.' });
  }
});

router.delete('/faculty/:id', (req, res) => {
  const facultyId = req.params.id;
  if (facultyId === req.user.id) {
    return res.status(400).json({ success: false, message: 'Security restriction: You cannot revoke your own credentials.' });
  }

  const user = db.get('users', facultyId);
  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEAN')) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' });
  }

  db.update('users', facultyId, { role: 'STUDENT', designation: 'Revoked' });
  return res.json({ success: true, message: `Privileges for ${user.name} have been revoked.` });
});

// Issue cryptographically secure administrator invitation token
router.post('/faculty/invite', (req, res) => {
  try {
    const { email, designation, department, expiresInHours = 48 } = req.body;
    const token = `inv-${crypto.randomBytes(16).toString('hex')}`;
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    const invitation = {
      id: `inv-${crypto.randomUUID()}`,
      token,
      email: cleanEmail,
      designation: designation ? designation.trim() : 'Placement Faculty Coordinator',
      department: department ? department.trim() : 'Training & Placement Cell',
      created_by: req.user.id,
      is_used: false,
      expires_at: new Date(Date.now() + Number(expiresInHours) * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };

    db.insert('adminInvitations', invitation);

    return res.status(201).json({
      success: true,
      message: 'Secure administrator invitation token generated successfully.',
      invitation: {
        token,
        email: invitation.email,
        expires_at: invitation.expires_at,
        designation: invitation.designation,
        department: invitation.department
      }
    });
  } catch (err) {
    console.error('[Admin Invite Error]:', err);
    return res.status(500).json({ success: false, message: 'Server error generating invitation token.' });
  }
});

// List all faculty access applications
router.get('/faculty/applications', (req, res) => {
  const applications = db.getAll('facultyApplications');
  applications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return res.json({ success: true, applications });
});

// Approve a faculty access application
router.post('/faculty/applications/:id/approve', (req, res) => {
  const app = db.get('facultyApplications', req.params.id);
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  // Generate an invitation token for the applicant
  const token = `inv-${crypto.randomBytes(16).toString('hex')}`;
  const invitation = {
    id: `inv-${crypto.randomUUID()}`,
    token,
    email: app.email,
    designation: app.designation,
    department: app.department,
    created_by: req.user.id,
    is_used: false,
    expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };

  db.insert('adminInvitations', invitation);
  db.update('facultyApplications', app.id, {
    status: 'APPROVED',
    invitation_token: token,
    approved_by: req.user.id,
    approved_at: new Date().toISOString()
  });

  return res.json({
    success: true,
    message: `Application for ${app.name} approved. Invitation token issued.`,
    invitation_token: token
  });
});

// Live visitor access logs & telemetry
router.get('/access-logs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    // Try PostgreSQL stats first if active
    if (isPostgresConfigured()) {
      const pgStats = await getPostgresAccessStats(limit);
      if (pgStats) {
        return res.json({
          success: true,
          engine: 'PostgreSQL (Cloud Active)',
          ...pgStats
        });
      }
    }

    // Fallback to local SQLite store
    const allLogs = db.getAll('accessLogs');
    allLogs.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const total_visits = allLogs.length;
    const unique_ips = new Set(allLogs.map(l => l.ip).filter(Boolean)).size;
    const avg_response_time_ms = total_visits > 0
      ? Math.round(allLogs.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / total_visits)
      : 0;

    return res.json({
      success: true,
      engine: 'SQLite (Local / Vercel Fallback)',
      source: 'SQLite',
      total_visits,
      unique_ips,
      avg_response_time_ms,
      recent_logs: allLogs.slice(0, limit)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve access telemetry logs.' });
  }
});

export default router;
