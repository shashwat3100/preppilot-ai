import crypto from 'crypto';
import db from '../database/db.js';
import RecommendationEngine from './recommendationEngine.js';

export class QuizEngine {
  /**
   * Retrieves all questions a student has ever answered or been assigned across sessions
   */
  static getStudentOptedQuestionHistory(userId) {
    const userAttempts = db.find('attempts', a => a.user_id === userId) || [];
    const userSessions = db.find('quizSessions', s => s.user_id === userId) || [];
    const userSessionIds = new Set(userSessions.map(s => s.id));
    const userQuizQuestions = db.find('quizQuestions', qq => userSessionIds.has(qq.session_id)) || [];

    const optedIds = new Set([
      ...userAttempts.map(a => a.question_id),
      ...userQuizQuestions.map(qq => qq.question_id)
    ]);

    const attemptStats = new Map();
    userAttempts.forEach(a => {
      const time = new Date(a.attempted_at || a.created_at || 0).getTime();
      const curr = attemptStats.get(a.question_id);
      if (!curr || time > curr.lastTime) {
        attemptStats.set(a.question_id, {
          lastTime: time,
          isCorrect: Boolean(a.is_correct)
        });
      }
    });

    return { optedIds, attemptStats };
  }

  /**
   * Generates a personalized Adaptive Daily Quiz for a student
   * Strictly prioritizes 100% fresh, unattempted questions whenever available
   */
  static generateAdaptiveDailyQuiz(userId, questionCount = 5) {
    const user = db.get('users', userId);
    if (!user) throw new Error('User not found');

    const { optedIds, attemptStats } = QuizEngine.getStudentOptedQuestionHistory(userId);

    // Retrieve high-scoring recommended questions from a large pool of 200 items
    const scoredQuestions = RecommendationEngine.getRecommendations(userId, 200);
    if (scoredQuestions.length === 0) {
      throw new Error('No questions available in the question bank for this profile.');
    }

    // Partition candidate pool into unattempted and previously attempted/opted
    const unattemptedPool = scoredQuestions.filter(q => !optedIds.has(q.id));
    const attemptedPool = scoredQuestions.filter(q => optedIds.has(q.id));

    const selectedMap = new Map();

    if (unattemptedPool.length >= questionCount) {
      // 100% FRESH UNATTEMPTED QUESTIONS GUARANTEE:
      const weakUnattempted = unattemptedPool.filter(q => (q.score_breakdown?.topic_weakness || 0) >= 20);
      const companyUnattempted = unattemptedPool.filter(q => (q.score_breakdown?.company_relevance || 0) >= 15);

      // 1. Weak topics (up to 40% of quiz)
      const weakTarget = Math.ceil(questionCount * 0.4);
      const shuffledWeak = [...weakUnattempted].sort(() => 0.5 - Math.random());
      shuffledWeak.slice(0, weakTarget).forEach(q => selectedMap.set(q.id, q));

      // 2. Target company relevant (up to 30% of quiz)
      const companyTarget = Math.ceil(questionCount * 0.7);
      const shuffledCompany = [...companyUnattempted].sort(() => 0.5 - Math.random());
      for (const q of shuffledCompany) {
        if (selectedMap.size >= companyTarget) break;
        selectedMap.set(q.id, q);
      }

      // 3. Fill remaining slots from unattempted candidates with variety
      const remainingUnattempted = unattemptedPool
        .filter(q => !selectedMap.has(q.id))
        .sort(() => 0.5 - Math.random());
      for (const q of remainingUnattempted) {
        if (selectedMap.size >= questionCount) break;
        selectedMap.set(q.id, q);
      }
    } else {
      // Candidate pool has fewer unattempted questions than requested:
      // Include all available fresh unattempted questions first
      unattemptedPool.forEach(q => selectedMap.set(q.id, q));

      // Fill remainder with attempted questions, prioritizing:
      // 1. Previously incorrect questions (spaced repetition revision)
      // 2. Oldest attempted questions
      const sortedAttempted = [...attemptedPool].sort((a, b) => {
        const statA = attemptStats.get(a.id);
        const statB = attemptStats.get(b.id);
        const incorrA = statA && !statA.isCorrect ? 1 : 0;
        const incorrB = statB && !statB.isCorrect ? 1 : 0;
        if (incorrA !== incorrB) return incorrB - incorrA;
        const timeA = statA ? statA.lastTime : 0;
        const timeB = statB ? statB.lastTime : 0;
        return timeA - timeB;
      });

      for (const q of sortedAttempted) {
        if (selectedMap.size >= questionCount) break;
        selectedMap.set(q.id, q);
      }
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
        weak_topics_targeted: quizQuestions.filter(q => (q.score_breakdown?.topic_weakness || 0) >= 20).map(w => w.topic_name),
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
        is_unattempted: !optedIds.has(q.id),
        has_attempted: optedIds.has(q.id),
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

    if (candidateQuestions.length === 0) {
      throw new Error('No questions match your selected custom criteria. Please broaden your filters.');
    }

    const { optedIds, attemptStats } = QuizEngine.getStudentOptedQuestionHistory(userId);

    // Partition candidate questions into unattempted and attempted
    const unattempted = candidateQuestions.filter(q => !optedIds.has(q.id));
    const attempted = candidateQuestions.filter(q => optedIds.has(q.id));

    // Shuffle unattempted questions for varied practice
    unattempted.sort(() => 0.5 - Math.random());

    let selectedQuestions = [];
    const countNeeded = Math.min(question_count, candidateQuestions.length);

    if (unattempted.length >= countNeeded) {
      // 100% fresh questions
      selectedQuestions = unattempted.slice(0, countNeeded);
    } else {
      // Take all available unattempted questions
      selectedQuestions = [...unattempted];
      const remainderNeeded = countNeeded - selectedQuestions.length;

      // Fill remainder with attempted questions, prioritizing previously incorrect and oldest attempts
      const sortedAttempted = [...attempted].sort((a, b) => {
        const statA = attemptStats.get(a.id);
        const statB = attemptStats.get(b.id);
        const incorrA = statA && !statA.isCorrect ? 1 : 0;
        const incorrB = statB && !statB.isCorrect ? 1 : 0;
        if (incorrA !== incorrB) return incorrB - incorrA;
        const timeA = statA ? statA.lastTime : 0;
        const timeB = statB ? statB.lastTime : 0;
        return timeA - timeB;
      });

      selectedQuestions = selectedQuestions.concat(sortedAttempted.slice(0, remainderNeeded));
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
          is_unattempted: !optedIds.has(q.id),
          has_attempted: optedIds.has(q.id),
          options: options.map(o => ({
            option_key: o.option_key,
            option_text: o.option_text
          }))
        };
      })
    };
  }

  /**
   * Helper to generate a deeply pedagogical explanation for why the chosen option is wrong
   * and why the correct option is right, handling negative constraint questions and option texts.
   */
  static explainMistakeDetails(q, chosenAnswer, chosenOpt, correctOpt, subject, topic) {
    const chosenNorm = (chosenAnswer || '').trim().toUpperCase();
    const correctNorm = (q.correct_answer || '').trim().toUpperCase();
    const isCorr = Boolean(chosenNorm && chosenNorm === correctNorm);
    const chosenText = chosenOpt ? chosenOpt.option_text : (chosenAnswer || 'No response');
    const correctText = correctOpt ? correctOpt.option_text : q.correct_answer;
    const baseExplanation = (q.explanation || '').trim();
    const isNegativeQuestion = /\b(NOT|EXCEPT|FALSE|INCORRECT|CANNOT|CAN NOT|NEVER|LEAST)\b/i.test(q.question || '');

    let whyCorrect = '';
    let whyIncorrect = '';

    if (isCorr) {
      whyCorrect = `Correct! Option (${q.correct_answer}) "${correctText}" is the right answer. ${correctOpt?.explanation || baseExplanation || `This satisfies all requirements for ${topic?.name || 'this concept'}.`}`;
      whyIncorrect = '';
    } else {
      // 1. Why Incorrect
      if (chosenOpt && chosenOpt.explanation) {
        whyIncorrect = `You selected Option (${chosenAnswer}) "${chosenText}". ${chosenOpt.explanation}`;
      } else if (isNegativeQuestion) {
        whyIncorrect = `You selected Option (${chosenAnswer || 'None'}) "${chosenText}". Notice that the question specifically contains a negative constraint asking which option does NOT apply. "${chosenText}" is actually an established, valid condition for ${topic?.name || 'this topic'}, which is why selecting it here is incorrect.`;
      } else {
        whyIncorrect = `You selected Option (${chosenAnswer || 'None'}) "${chosenText}". This option does not satisfy the requirements of ${topic?.name || 'this problem'}, because it either contradicts the underlying principle or belongs to a different classification.`;
      }

      // 2. Why Correct
      if (correctOpt && correctOpt.explanation) {
        whyCorrect = `The exact correct answer is Option (${q.correct_answer}) "${correctText}". ${correctOpt.explanation}`;
      } else if (baseExplanation) {
        if (isNegativeQuestion) {
          whyCorrect = `The exact correct answer is Option (${q.correct_answer}) "${correctText}". ${baseExplanation} Because "${correctText}" is the exception or prevention technique, it correctly answers what is NOT a required condition.`;
        } else {
          whyCorrect = `The exact correct answer is Option (${q.correct_answer}) "${correctText}". ${baseExplanation}`;
        }
      } else {
        whyCorrect = `The exact correct answer is Option (${q.correct_answer}) "${correctText}". This is the standard, verified principle in ${topic?.name || subject?.name || 'computer science'}.`;
      }
    }

    return {
      chosenText,
      correctText,
      whyCorrect,
      whyIncorrect,
      isNegativeQuestion
    };
  }

  /**
   * Submits answers, grades quiz, calculates XP with speed bonus,
   * updates topic weaknesses, streaks, and user level.
   */
  static submitQuiz(sessionId, userId, answers = [], totalTimeTaken = 0) {
    const session = db.get('quizSessions', sessionId);
    if (!session) throw new Error('Quiz session not found');

    if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
      throw new Error('Assessment deadline has expired. Submissions are no longer accepted.');
    }

    const user = db.get('users', userId);
    if (!user) throw new Error('User not found');

    if (session.user_id !== userId && user.role !== 'ADMIN') {
      throw new Error('Unauthorized: You cannot submit answers for another student\'s quiz session.');
    }

    const allQuestions = db.getAll('questions');
    let correctCount = 0;
    let earnedXp = 0;
    const gradedDetails = [];
    const affectedTopicMap = new Map();

    // Map answers by question_id
    const answersMap = new Map();
    answers.forEach(a => answersMap.set(a.question_id, a));

    // Idempotent Lock: If session is already completed, candidate answers cannot be altered
    if (session.status === 'COMPLETED') {
      const existingAttempts = db.find('attempts', a => a.session_id === sessionId);
      const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === sessionId);
      const graded = sessionQuestions.map((qq, idx) => {
        const q = allQuestions.find(item => item.id === qq.question_id) || {};
        const qOptions = db.find('questionOptions', opt => opt.question_id === q.id);
        const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (qq.user_answer || '').toUpperCase());
        const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
        const isCorr = Boolean(qq.is_correct);

        const subject = db.get('subjects', q.subject_id);
        const topic = db.get('topics', q.topic_id);
        const details = QuizEngine.explainMistakeDetails(q, qq.user_answer || '', chosenOpt, correctOpt, subject, topic);

        return {
          question_id: q.id,
          sequence: qq.sequence_order || (idx + 1),
          question: q.question,
          chosen_answer: qq.user_answer,
          chosen_text: details.chosenText,
          correct_answer: q.correct_answer,
          correct_text: details.correctText,
          is_correct: isCorr,
          why_correct: details.whyCorrect,
          why_incorrect: details.whyIncorrect,
          explanation: q.explanation,
          is_negative_constraint: details.isNegativeQuestion,
          options: qOptions.map(o => ({
            option_key: o.option_key,
            option_text: o.option_text,
            is_correct: (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase(),
            explanation: o.explanation || ''
          })),
          time_spent: qq.time_spent_seconds || 30,
          xp_gained: isCorr ? (q.xp_value || 20) : 0,
          subject_name: subject?.name,
          topic_name: topic?.name
        };
      });

      return {
        session_id: sessionId,
        status: 'COMPLETED',
        total_questions: session.total_questions,
        correct_count: session.correct_count,
        accuracy_rate: session.score,
        xp_earned: session.xp_earned,
        time_taken_seconds: session.time_taken_seconds,
        is_locked: true,
        graded_questions: graded,
        weak_topics: []
      };
    }

    // Get all questions in this session
    const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === sessionId);

    for (const qq of sessionQuestions) {
      const q = allQuestions.find(item => item.id === qq.question_id);
      if (!q) continue;

      const userSubmission = answersMap.get(q.id);
      const chosenAnswer = userSubmission?.answer || userSubmission?.selected_option || userSubmission?.chosen_answer || '';
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

      // Track in Mistake Vault for personalized spaced repetition
      try {
        const mvId = `mv-${userId}-${q.id}`;
        const existingMv = db.get('mistakeVault', mvId);
        const nowIso = new Date().toISOString();
        if (!isCorrect) {
          if (existingMv) {
            db.update('mistakeVault', mvId, {
              last_attempt_id: attemptId,
              last_chosen_answer: chosenAnswer,
              mistake_count: (existingMv.mistake_count || 1) + 1,
              mastery_status: 'unresolved',
              updated_at: nowIso
            });
          } else {
            db.insert('mistakeVault', {
              id: mvId,
              user_id: userId,
              question_id: q.id,
              source_type: 'quiz',
              last_attempt_id: attemptId,
              last_chosen_answer: chosenAnswer,
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
            last_chosen_answer: chosenAnswer,
            mastery_status: 'mastered',
            mastered_at: nowIso,
            updated_at: nowIso
          });
        }
      } catch (mvErr) {
        console.warn('[MistakeVault Error in submitQuiz]:', mvErr.message);
      }

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

      // Build tailored why_correct and why_incorrect responses
      const qOptions = db.find('questionOptions', opt => opt.question_id === q.id);
      const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === chosenAnswer.toUpperCase());
      const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === q.correct_answer.toUpperCase());

      const details = QuizEngine.explainMistakeDetails(q, chosenAnswer, chosenOpt, correctOpt, subject, topic);

      gradedDetails.push({
        question_id: q.id,
        sequence: qq.sequence_order || (gradedDetails.length + 1),
        question: q.question,
        chosen_answer: chosenAnswer,
        chosen_text: details.chosenText,
        correct_answer: q.correct_answer,
        correct_text: details.correctText,
        is_correct: isCorrect,
        why_correct: details.whyCorrect,
        why_incorrect: details.whyIncorrect,
        explanation: q.explanation,
        is_negative_constraint: details.isNegativeQuestion,
        options: qOptions.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text,
          is_correct: (o.option_key || '').toUpperCase() === q.correct_answer.toUpperCase(),
          explanation: o.explanation || ''
        })),
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

  /**
   * Returns available assessments with live question counts from database
   */
  static getAssessmentCatalog() {
    const allQuestions = db.getAll('questions');

    const coreCsSubjects = new Set(['sub-os', 'sub-dbms', 'sub-cn', 'sub-oop', 'sub-dsa']);
    const coreCsAvail = allQuestions.filter(q => coreCsSubjects.has(q.subject_id)).length;

    const tcsAvail = allQuestions.filter(q =>
      q.subject_id === 'sub-aptitude' ||
      q.company_id === 'comp-tcs' ||
      q.subject_id === 'sub-dsa' ||
      q.subject_id === 'sub-oop' ||
      q.subject_id === 'sub-dbms'
    ).length;

    const dsaAvail = allQuestions.filter(q => q.subject_id === 'sub-dsa').length;

    return [
      {
        id: 'asmt-core-cs',
        type: 'core-cs',
        title: 'Core Computer Science Comprehensive Assessment',
        category: 'Core Computer Science',
        question_count: 20,
        questionCount: 20,
        availableQuestions: coreCsAvail,
        duration_minutes: 25,
        durationMinutes: 25,
        description: 'Comprehensive 20-question evaluation across Data Structures & Algorithms, Operating Systems, DBMS Normalization, Computer Networks, and Object-Oriented Principles.',
        passingPercent: 65,
        subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Object Oriented Programming']
      },
      {
        id: 'asmt-tcs-nqt',
        type: 'tcs-nqt',
        title: 'TCS-Style National Qualifier Mock Assessment',
        category: 'Company Recruitment',
        question_count: 30,
        questionCount: 30,
        availableQuestions: tcsAvail,
        duration_minutes: 45,
        durationMinutes: 45,
        description: 'Authentic 30-question screening test following TCS NQT patterns: Quantitative Aptitude, Logical Reasoning, and Technical CS Foundations.',
        passingPercent: 60,
        subjects: ['General Aptitude & Reasoning', 'Data Structures & Algorithms', 'C / C++ Fundamentals']
      },
      {
        id: 'asmt-dsa-mastery',
        type: 'dsa-mastery',
        title: 'Data Structures & Algorithms Mastery Test',
        category: 'Algorithms & Problem Solving',
        question_count: 15,
        questionCount: 15,
        availableQuestions: dsaAvail,
        duration_minutes: 30,
        durationMinutes: 30,
        description: 'Focused 15-question technical drill covering Trees, Graphs, Hashing, Heaps, and Time/Space Complexity.',
        passingPercent: 70,
        subjects: ['Data Structures & Algorithms']
      },
      {
        id: 'asmt-full-simulation',
        type: 'full-simulation',
        title: 'Full Campus Placement Simulation (Quiz + Live Coding)',
        category: 'Comprehensive Screening',
        question_count: 10,
        questionCount: 10,
        hasCodingSection: true,
        duration_minutes: 35,
        durationMinutes: 35,
        description: 'Dual-section evaluation simulating corporate drives: 10 technical MCQs followed by a live programming challenge evaluated against automated test cases.',
        passingPercent: 70,
        subjects: ['Core Engineering', 'Data Structures & Algorithms']
      }
    ];
  }

  /**
   * Generates a timed assessment session with exact requested question counts
   */
  static generateAssessment(userId, assessmentType = 'core-cs') {
    const user = db.get('users', userId);
    if (!user) throw new Error('User not found');

    const allQuestions = db.getAll('questions');
    let targetQuestions = [];
    let requiredCount = 20;
    let durationMinutes = 25;
    let assessmentTitle = 'Core Computer Science Comprehensive Assessment';
    let category = 'Core Computer Science';

    const normalizedType = (assessmentType || '').toLowerCase().replace(/^asmt-/, '');

    if (normalizedType.includes('core') || normalizedType === 'core-cs' || normalizedType === 'core-cs-full') {
      requiredCount = 20;
      durationMinutes = 25;
      assessmentTitle = 'Core Computer Science Comprehensive Assessment';
      category = 'Core Computer Science';
      const coreSubjects = new Set(['sub-os', 'sub-dbms', 'sub-cn', 'sub-oop', 'sub-dsa']);
      targetQuestions = allQuestions.filter(q => coreSubjects.has(q.subject_id));
      if (targetQuestions.length < requiredCount) {
        targetQuestions = allQuestions.filter(q => q.subject_id !== 'sub-aptitude');
      }
    } else if (normalizedType.includes('tcs') || normalizedType === 'tcs-nqt' || normalizedType === 'tcs-nqt-simulation') {
      requiredCount = 30;
      durationMinutes = 45;
      assessmentTitle = 'TCS-Style National Qualifier Mock Assessment';
      category = 'Company Recruitment';
      targetQuestions = allQuestions.filter(q =>
        q.subject_id === 'sub-aptitude' ||
        q.company_id === 'comp-tcs' ||
        q.subject_id === 'sub-dsa' ||
        q.subject_id === 'sub-oop' ||
        q.subject_id === 'sub-dbms' ||
        q.subject_id === 'sub-os' ||
        q.subject_id === 'sub-cn'
      );
    } else if (normalizedType.includes('dsa') || normalizedType === 'dsa-mastery' || normalizedType === 'dsa-fundamentals') {
      requiredCount = 15;
      durationMinutes = 30;
      assessmentTitle = 'Data Structures & Algorithms Mastery Test';
      category = 'Algorithms & Problem Solving';
      targetQuestions = allQuestions.filter(q => q.subject_id === 'sub-dsa');
    } else if (normalizedType.includes('simulation') || normalizedType === 'full-simulation') {
      requiredCount = 10;
      durationMinutes = 35;
      assessmentTitle = 'Full Campus Placement Simulation (Quiz + Live Coding)';
      category = 'Comprehensive Screening';
      targetQuestions = allQuestions.filter(q => q.subject_id !== 'sub-aptitude');
    } else {
      targetQuestions = allQuestions;
      requiredCount = 15;
      durationMinutes = 20;
    }

    if (targetQuestions.length === 0) {
      throw new Error(`No questions available for assessment type: ${assessmentType}`);
    }

    const { optedIds, attemptStats } = QuizEngine.getStudentOptedQuestionHistory(userId);

    const unattempted = targetQuestions.filter(q => !optedIds.has(q.id));
    const attempted = targetQuestions.filter(q => optedIds.has(q.id));

    unattempted.sort(() => 0.5 - Math.random());

    let selected = [];
    const countNeeded = Math.min(requiredCount, targetQuestions.length);

    if (unattempted.length >= countNeeded) {
      if (normalizedType.includes('core')) {
        // Balanced distribution across the 5 core disciplines (DSA, DBMS, OS, CN, OOP)
        const coreSet = new Set(['sub-os', 'sub-dbms', 'sub-cn', 'sub-oop', 'sub-dsa']);
        const bySubject = new Map();
        for (const sId of coreSet) bySubject.set(sId, []);
        unattempted.forEach(q => {
          if (bySubject.has(q.subject_id)) bySubject.get(q.subject_id).push(q);
        });

        const targetPerSubject = Math.floor(countNeeded / coreSet.size); // 4 per subject for 20 questions
        const pickedMap = new Map();

        // 1. Pick target quota from each core subject (shuffled)
        for (const [sId, list] of bySubject.entries()) {
          list.sort(() => 0.5 - Math.random());
          list.slice(0, targetPerSubject).forEach(q => pickedMap.set(q.id, q));
        }

        // 2. Fill any remaining slots with variety from unattempted core questions
        const remainingCore = unattempted
          .filter(q => !pickedMap.has(q.id))
          .sort(() => 0.5 - Math.random());
        for (const q of remainingCore) {
          if (pickedMap.size >= countNeeded) break;
          pickedMap.set(q.id, q);
        }

        selected = Array.from(pickedMap.values());
      } else {
        selected = unattempted.slice(0, countNeeded);
      }
    } else {
      selected = [...unattempted];
      const remainderNeeded = countNeeded - selected.length;
      const sortedAttempted = [...attempted].sort((a, b) => {
        const statA = attemptStats.get(a.id);
        const statB = attemptStats.get(b.id);
        const incorrA = statA && !statA.isCorrect ? 1 : 0;
        const incorrB = statB && !statB.isCorrect ? 1 : 0;
        if (incorrA !== incorrB) return incorrB - incorrA;
        const timeA = statA ? statA.lastTime : 0;
        const timeB = statB ? statB.lastTime : 0;
        return timeA - timeB;
      });
      selected = selected.concat(sortedAttempted.slice(0, remainderNeeded));
    }

    const sessionId = `asmt-sess-${crypto.randomUUID()}`;
    const session = {
      id: sessionId,
      user_id: userId,
      mode: 'TIMED_ASSESSMENT',
      assessment_type: assessmentType,
      assessment_title: assessmentTitle,
      category,
      duration_minutes: durationMinutes,
      status: 'IN_PROGRESS',
      total_questions: selected.length,
      correct_count: 0,
      score: 0.0,
      xp_earned: 0,
      time_taken_seconds: 0,
      created_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('quizSessions', session);

    // Save session questions
    const allOptions = db.getAll('questionOptions');
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

    const populatedQuestions = selected.map((q, idx) => {
      const subject = db.get('subjects', q.subject_id);
      const topic = db.get('topics', q.topic_id);
      const options = allOptions.filter(o => o.question_id === q.id);

      return {
        id: q.id,
        sequence: idx + 1,
        question: q.question,
        question_type: q.question_type,
        difficulty: q.difficulty,
        subject_name: subject?.name || 'Computer Science',
        topic_name: topic?.name || 'General',
        expected_time: q.expected_time,
        xp_value: q.xp_value,
        options: options.map(o => ({
          id: o.id,
          option_key: o.option_key,
          option_text: o.option_text
        }))
      };
    });

    return {
      session_id: sessionId,
      assessment_type: assessmentType,
      title: assessmentTitle,
      category,
      duration_minutes: durationMinutes,
      total_questions: populatedQuestions.length,
      questions: populatedQuestions
    };
  }
}

export default QuizEngine;
