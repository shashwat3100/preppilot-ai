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
      const graded = sessionQuestions.map(qq => {
        const q = allQuestions.find(item => item.id === qq.question_id) || {};
        const qOptions = db.find('questionOptions', opt => opt.question_id === q.id);
        const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (qq.user_answer || '').toUpperCase());
        const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
        const isCorr = Boolean(qq.is_correct);

        const chosenText = chosenOpt ? chosenOpt.option_text : (qq.user_answer || 'No response');
        const correctText = correctOpt ? correctOpt.option_text : q.correct_answer;

        const whyCorr = correctOpt?.explanation || q.explanation || `Option (${q.correct_answer}) is the correct answer.`;
        const whyIncorr = isCorr
          ? ''
          : (chosenOpt?.explanation || `You selected Option (${qq.user_answer}) "${chosenText}", which is incorrect for this problem.`);

        const subject = db.get('subjects', q.subject_id);
        const topic = db.get('topics', q.topic_id);

        return {
          question_id: q.id,
          question: q.question,
          chosen_answer: qq.user_answer,
          chosen_text: chosenText,
          correct_answer: q.correct_answer,
          correct_text: correctText,
          is_correct: isCorr,
          why_correct: whyCorr,
          why_incorrect: whyIncorr,
          explanation: q.explanation,
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

      const chosenText = chosenOpt ? chosenOpt.option_text : (chosenAnswer || 'No response');
      const correctText = correctOpt ? correctOpt.option_text : q.correct_answer;

      let whyCorrect = correctOpt?.explanation || q.explanation || `Option (${q.correct_answer}) is the correct answer.`;
      let whyIncorrect = '';

      if (isCorrect) {
        whyCorrect = `Correct! Option (${q.correct_answer}) "${correctText}" is the right answer. ${whyCorrect}`;
      } else {
        if (chosenOpt && chosenOpt.explanation) {
          whyIncorrect = `You selected Option (${chosenAnswer}) "${chosenText}", which is incorrect. ${chosenOpt.explanation}`;
        } else {
          whyIncorrect = `You selected Option (${chosenAnswer || 'None'}) "${chosenText}", which is incorrect for this problem.`;
        }
      }

      gradedDetails.push({
        question_id: q.id,
        question: q.question,
        chosen_answer: chosenAnswer,
        chosen_text: chosenText,
        correct_answer: q.correct_answer,
        correct_text: correctText,
        is_correct: isCorrect,
        why_correct: whyCorrect,
        why_incorrect: whyIncorrect,
        explanation: q.explanation,
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

    const coreCsSubjects = new Set(['sub-os', 'sub-dbms', 'sub-cn', 'sub-oop']);
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
        description: 'Comprehensive 20-question evaluation across Operating Systems, DBMS Normalization, Computer Networks, and Object-Oriented Principles.',
        passingPercent: 65,
        subjects: ['Operating Systems', 'Database Management Systems', 'Computer Networks', 'Object Oriented Programming']
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
      const coreSubjects = new Set(['sub-os', 'sub-dbms', 'sub-cn', 'sub-oop']);
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

    // Shuffle questions
    const shuffled = [...targetQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(requiredCount, shuffled.length));

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
