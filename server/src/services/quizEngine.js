import crypto from 'crypto';
import db from '../database/db.js';
import RecommendationEngine from './recommendationEngine.js';

export class QuizEngine {
  /**
   * Generates a personalized Adaptive Daily Quiz for a student
   */
  static generateAdaptiveDailyQuiz(userId, questionCount = 5) {
    const user = db.get('users', userId);
    if (!user) throw new Error('User not found');

    // Retrieve high-scoring recommended questions
    const scoredQuestions = RecommendationEngine.getRecommendations(userId, 30);
    if (scoredQuestions.length === 0) {
      throw new Error('No questions available in the question bank for this profile.');
    }

    // Stratified sampling: Prioritize weak topics + company pattern questions
    const weakQuestions = scoredQuestions.filter(q => q.score_breakdown.topic_weakness >= 20);
    const companyQuestions = scoredQuestions.filter(q => q.score_breakdown.company_relevance >= 15);
    const freshQuestions = scoredQuestions.filter(q => q.score_breakdown.unattempted_priority >= 10);

    const selectedMap = new Map();

    // 1. Weak topics (up to 40% of quiz)
    weakQuestions.slice(0, Math.ceil(questionCount * 0.4)).forEach(q => selectedMap.set(q.id, q));

    // 2. Company relevant (up to 30% of quiz)
    for (const q of companyQuestions) {
      if (selectedMap.size >= Math.ceil(questionCount * 0.7)) break;
      selectedMap.set(q.id, q);
    }

    // 3. Fill remaining with highest overall recommendation score
    for (const q of scoredQuestions) {
      if (selectedMap.size >= questionCount) break;
      selectedMap.set(q.id, q);
    }

    const quizQuestions = Array.from(selectedMap.values());

    // Create a new Quiz Session
    const sessionId = `session-${crypto.randomUUID()}`;
    const session = {
      id: sessionId,
      user_id: userId,
      mode: 'ADAPTIVE_DAILY',
      status: 'IN_PROGRESS',
      total_questions: quizQuestions.length,
      correct_count: 0,
      score: 0.0,
      xp_earned: 0,
      time_taken_seconds: 0,
      config_params: {
        weak_topics_targeted: weakQuestions.map(w => w.topic_name),
        companies_targeted: user.target_companies || []
      },
      created_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('quizSessions', session);

    // Save session questions
    quizQuestions.forEach((q, idx) => {
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

    return {
      session_id: sessionId,
      mode: 'ADAPTIVE_DAILY',
      total_questions: quizQuestions.length,
      questions: quizQuestions.map((q, idx) => ({
        id: q.id,
        sequence: idx + 1,
        question: q.question,
        question_type: q.question_type,
        difficulty: q.difficulty,
        subject_name: q.subject_name,
        topic_name: q.topic_name,
        company_name: q.company_name,
        expected_time: q.expected_time,
        xp_value: q.xp_value,
        recommendation_reason: q.recommendation_reason,
        options: q.options.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text
        }))
      }))
    };
  }

  /**
   * Generates a Custom Practice Quiz based on user-chosen filters
   */
  static generateCustomQuiz(userId, filters) {
    const {
      branch_id,
      company_id,
      job_role_id,
      subject_ids = [],
      topic_ids = [],
      difficulty,
      question_count = 10
    } = filters;

    let candidateQuestions = db.getAll('questions');
    const allOptions = db.getAll('questionOptions');

    // Filter by branch
    if (branch_id) {
      candidateQuestions = candidateQuestions.filter(q => !q.branch_id || q.branch_id === branch_id);
    }

    // Filter by company
    if (company_id) {
      candidateQuestions = candidateQuestions.filter(q => q.company_id === company_id);
    }

    // Filter by job role
    if (job_role_id) {
      candidateQuestions = candidateQuestions.filter(q => !q.job_role_id || q.job_role_id === job_role_id);
    }

    // Filter by subjects (supports array or single)
    if (subject_ids && subject_ids.length > 0) {
      const subjectSet = new Set(Array.isArray(subject_ids) ? subject_ids : [subject_ids]);
      candidateQuestions = candidateQuestions.filter(q => subjectSet.has(q.subject_id));
    }

    // Filter by topics
    if (topic_ids && topic_ids.length > 0) {
      const topicSet = new Set(Array.isArray(topic_ids) ? topic_ids : [topic_ids]);
      candidateQuestions = candidateQuestions.filter(q => topicSet.has(q.topic_id));
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      candidateQuestions = candidateQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle questions
    candidateQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = candidateQuestions.slice(0, Math.min(question_count, candidateQuestions.length));

    if (selectedQuestions.length === 0) {
      throw new Error('No questions match your selected custom criteria. Please broaden your filters.');
    }

    const sessionId = `session-${crypto.randomUUID()}`;
    const session = {
      id: sessionId,
      user_id: userId,
      mode: 'CUSTOM_PRACTICE',
      status: 'IN_PROGRESS',
      total_questions: selectedQuestions.length,
      correct_count: 0,
      score: 0.0,
      xp_earned: 0,
      time_taken_seconds: 0,
      config_params: filters,
      created_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('quizSessions', session);

    selectedQuestions.forEach((q, idx) => {
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

    return {
      session_id: sessionId,
      mode: 'CUSTOM_PRACTICE',
      total_questions: selectedQuestions.length,
      questions: selectedQuestions.map((q, idx) => {
        const subject = db.get('subjects', q.subject_id);
        const topic = db.get('topics', q.topic_id);
        const company = q.company_id ? db.get('companies', q.company_id) : null;
        const options = allOptions.filter(o => o.question_id === q.id);

        return {
          id: q.id,
          sequence: idx + 1,
          question: q.question,
          question_type: q.question_type,
          difficulty: q.difficulty,
          subject_name: subject?.name || 'Computer Science',
          topic_name: topic?.name || 'General',
          company_name: company?.name || 'General Pattern',
          expected_time: q.expected_time,
          xp_value: q.xp_value,
          options: options.map(o => ({
            option_key: o.option_key,
            option_text: o.option_text
          }))
        };
      })
    };
  }

  /**
   * Submits answers, grades quiz, calculates XP with speed bonus,
   * updates topic weaknesses, streaks, and user level.
   */
  static submitQuiz(sessionId, userId, answers = [], totalTimeTaken = 0) {
    const session = db.get('quizSessions', sessionId);
    if (!session) throw new Error('Quiz session not found');

    const user = db.get('users', userId);
    if (!user) throw new Error('User not found');

    const allQuestions = db.getAll('questions');
    let correctCount = 0;
    let earnedXp = 0;
    const gradedDetails = [];
    const affectedTopicMap = new Map();

    // Map answers by question_id
    const answersMap = new Map();
    answers.forEach(a => answersMap.set(a.question_id, a));

    // Get all questions in this session
    const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === sessionId);

    for (const qq of sessionQuestions) {
      const q = allQuestions.find(item => item.id === qq.question_id);
      if (!q) continue;

      const userSubmission = answersMap.get(q.id);
      const chosenAnswer = userSubmission?.answer || '';
      const timeSpent = userSubmission?.time_spent || 30;

      const isCorrect = chosenAnswer.trim().toUpperCase() === q.correct_answer.trim().toUpperCase();
      let questionXp = 0;

      if (isCorrect) {
        correctCount += 1;
        questionXp = q.xp_value || 20;

        // Speed bonus: If answered correctly in less than 60% of expected time
        if (timeSpent < (q.expected_time * 0.6)) {
          questionXp += 10; // Fast-answer bonus
        }
        earnedXp += questionXp;
      }

      // Record in attempts table
      const attemptId = `att-${crypto.randomUUID()}`;
      db.insert('attempts', {
        id: attemptId,
        user_id: userId,
        question_id: q.id,
        session_id: sessionId,
        user_answer: chosenAnswer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
        xp_gained: questionXp,
        attempted_at: new Date().toISOString()
      });

      // Update quizQuestions join record
      db.update('quizQuestions', qq.id, {
        user_answer: chosenAnswer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent
      });

      // Track topic performance stats
      if (!affectedTopicMap.has(q.topic_id)) {
        affectedTopicMap.set(q.topic_id, {
          subject_id: q.subject_id,
          topic_id: q.topic_id,
          attempts: 0,
          correct: 0
        });
      }
      const tStat = affectedTopicMap.get(q.topic_id);
      tStat.attempts += 1;
      if (isCorrect) tStat.correct += 1;

      const subject = db.get('subjects', q.subject_id);
      const topic = db.get('topics', q.topic_id);

      gradedDetails.push({
        question_id: q.id,
        question: q.question,
        chosen_answer: chosenAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
        time_spent: timeSpent,
        xp_gained: questionXp,
        subject_name: subject?.name,
        topic_name: topic?.name
      });
    }

    // Perfect score bonus
    if (correctCount === session.total_questions && session.total_questions >= 3) {
      earnedXp += 50; // Flawless round bonus
    }

    const accuracyRate = session.total_questions > 0 ? (correctCount / session.total_questions) * 100 : 0;

    // Update Session
    db.update('quizSessions', sessionId, {
      status: 'COMPLETED',
      correct_count: correctCount,
      score: accuracyRate,
      xp_earned: earnedXp,
      time_taken_seconds: totalTimeTaken,
      completed_at: new Date().toISOString()
    });

    // Update Student Performance & Weakness Scores
    const newlyIdentifiedWeakTopics = [];
    const newlyMasteredTopics = [];

    for (const [topicId, stat] of affectedTopicMap.entries()) {
      let perf = db.findOne('studentPerformance', p => p.user_id === userId && p.topic_id === topicId);
      const topic = db.get('topics', topicId);

      if (!perf) {
        const acc = (stat.correct / stat.attempts) * 100;
        const weakness = parseFloat((1.0 - (acc / 100)).toFixed(2));
        perf = {
          id: `perf-${crypto.randomUUID()}`,
          user_id: userId,
          topic_id: topicId,
          subject_id: stat.subject_id,
          attempts_count: stat.attempts,
          correct_count: stat.correct,
          accuracy_rate: acc,
          weakness_score: weakness,
          last_attempted_at: new Date().toISOString()
        };
        db.insert('studentPerformance', perf);
      } else {
        const totalAtt = (perf.attempts_count || 0) + stat.attempts;
        const totalCorr = (perf.correct_count || 0) + stat.correct;
        const acc = (totalCorr / totalAtt) * 100;
        const weakness = parseFloat((1.0 - (acc / 100)).toFixed(2));

        db.update('studentPerformance', perf.id, {
          attempts_count: totalAtt,
          correct_count: totalCorr,
          accuracy_rate: acc,
          weakness_score: weakness,
          last_attempted_at: new Date().toISOString()
        });

        if (weakness > 0.6 && topic) {
          newlyIdentifiedWeakTopics.push(topic.name);
        } else if (weakness < 0.25 && topic) {
          newlyMasteredTopics.push(topic.name);
        }
      }
    }

    // Update XP and Level
    const newTotalXp = (user.total_xp || 0) + earnedXp;
    const newLevel = Math.floor(newTotalXp / 250) + 1;

    // Update Streak
    let streakRecord = db.findOne('streaks', s => s.user_id === userId);
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = streakRecord ? streakRecord.current_streak : 1;
    let longestStreak = streakRecord ? streakRecord.longest_streak : 1;

    if (!streakRecord) {
      streakRecord = {
        id: `streak-${userId}`,
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        streak_freeze_count: 2
      };
      db.insert('streaks', streakRecord);
    } else {
      const lastDate = streakRecord.last_activity_date;
      if (lastDate !== today) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.round((todayObj - lastDateObj) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
          if (currentStreak > longestStreak) longestStreak = currentStreak;
        } else if (diffDays > 1) {
          // Streak broken
          currentStreak = 1;
        }

        db.update('streaks', streakRecord.id, {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_activity_date: today
        });
      }
    }

    // Update user record
    db.update('users', userId, {
      total_xp: newTotalXp,
      current_level: newLevel,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today
    });

    // Record XP event
    db.insert('xpHistory', {
      id: `xph-${crypto.randomUUID()}`,
      user_id: userId,
      amount: earnedXp,
      action_type: session.mode === 'ADAPTIVE_DAILY' ? 'ADAPTIVE_DAILY_QUIZ' : 'CUSTOM_PRACTICE_QUIZ',
      reference_id: sessionId,
      created_at: new Date().toISOString()
    });

    return {
      session_id: sessionId,
      total_questions: session.total_questions,
      correct_count: correctCount,
      incorrect_count: session.total_questions - correctCount,
      accuracy_rate: Math.round(accuracyRate),
      xp_earned: earnedXp,
      total_xp: newTotalXp,
      current_level: newLevel,
      current_streak: currentStreak,
      time_taken_seconds: totalTimeTaken,
      graded_questions: gradedDetails,
      weak_topics: Array.from(new Set(newlyIdentifiedWeakTopics)),
      mastered_topics: Array.from(new Set(newlyMasteredTopics)),
      recommendation_summary: accuracyRate >= 75
        ? 'Great job! Your conceptual grasp is solid. Continue to timed mock interview questions.'
        : 'Identified concepts requiring revision. We have automatically calibrated your next Adaptive Daily Quiz to reinforce these topics.'
    };
  }
}

export default QuizEngine;
