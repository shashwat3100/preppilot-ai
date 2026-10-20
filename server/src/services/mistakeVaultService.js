import crypto from 'crypto';
import db from '../database/db.js';
import QuizEngine from './quizEngine.js';

export class MistakeVaultService {
  /**
   * Records or updates a mistake vault record when an answer is evaluated.
   */
  static recordAttempt({ userId, questionId, chosenAnswer, isCorrect, attemptId = null, sourceType = 'quiz' }) {
    if (!userId || !questionId) return;

    const mvId = `mv-${userId}-${questionId}`;
    const existing = db.get('mistakeVault', mvId);
    const now = new Date().toISOString();

    if (!isCorrect) {
      if (existing) {
        db.update('mistakeVault', mvId, {
          last_attempt_id: attemptId || existing.last_attempt_id,
          last_chosen_answer: chosenAnswer || existing.last_chosen_answer,
          mistake_count: (existing.mistake_count || 1) + 1,
          mastery_status: 'unresolved',
          updated_at: now
        });
      } else {
        db.insert('mistakeVault', {
          id: mvId,
          user_id: userId,
          question_id: questionId,
          source_type: sourceType,
          last_attempt_id: attemptId,
          last_chosen_answer: chosenAnswer || '',
          mistake_count: 1,
          mastery_status: 'unresolved',
          mastered_at: null,
          created_at: now,
          updated_at: now
        });
      }
    } else {
      // Correct answer: If it was in the mistake vault as unresolved, update to mastered
      if (existing && existing.mastery_status === 'unresolved') {
        db.update('mistakeVault', mvId, {
          last_attempt_id: attemptId || existing.last_attempt_id,
          last_chosen_answer: chosenAnswer || existing.last_chosen_answer,
          mastery_status: 'mastered',
          mastered_at: now,
          updated_at: now
        });
      }
    }
  }

  /**
   * Synchronizes historical attempts for a user so prior mistakes are not lost.
   */
  static syncHistoricalAttempts(userId) {
    if (!userId) return;

    try {
      const userAttempts = db.find('attempts', a => a.user_id === userId) || [];
      if (userAttempts.length === 0) return;

      // Group attempts by question_id and determine the most recent status
      const byQuestion = new Map();
      userAttempts.forEach(att => {
        const qid = att.question_id;
        if (!byQuestion.has(qid)) {
          byQuestion.set(qid, []);
        }
        byQuestion.get(qid).push(att);
      });

      const existingVault = new Set((db.find('mistakeVault', mv => mv.user_id === userId) || []).map(mv => mv.question_id));

      for (const [qid, attList] of byQuestion.entries()) {
        const hasMistake = attList.some(a => a.is_correct === false || a.is_correct === 0);
        if (hasMistake && !existingVault.has(qid)) {
          // Sort by date ascending to find first and last
          attList.sort((a, b) => new Date(a.attempted_at || a.created_at || 0) - new Date(b.attempted_at || b.created_at || 0));
          const mistakeAttempts = attList.filter(a => a.is_correct === false || a.is_correct === 0);
          const lastAttempt = attList[attList.length - 1];
          const isCurrentlyResolved = Boolean(lastAttempt.is_correct);

          const mvId = `mv-${userId}-${qid}`;
          const lastMistake = mistakeAttempts[mistakeAttempts.length - 1];

          db.insert('mistakeVault', {
            id: mvId,
            user_id: userId,
            question_id: qid,
            source_type: qid.includes('apt') ? 'aptitude' : 'quiz',
            last_attempt_id: lastMistake.id,
            last_chosen_answer: lastMistake.user_answer || lastMistake.chosen_answer || '',
            mistake_count: mistakeAttempts.length,
            mastery_status: isCurrentlyResolved ? 'mastered' : 'unresolved',
            mastered_at: isCurrentlyResolved ? (lastAttempt.attempted_at || lastAttempt.created_at) : null,
            created_at: mistakeAttempts[0].attempted_at || mistakeAttempts[0].created_at || new Date().toISOString(),
            updated_at: lastAttempt.attempted_at || lastAttempt.created_at || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('[MistakeVault Sync Warning]:', err.message);
    }
  }

  /**
   * Retrieves enriched mistake vault questions and analytics for a user.
   */
  static getUserMistakes(userId, { status = 'all', subjectId = null, search = null } = {}) {
    this.syncHistoricalAttempts(userId);

    const vaultItems = db.find('mistakeVault', mv => mv.user_id === userId) || [];
    const allQuestions = db.getAll('questions') || [];
    const allOptions = db.getAll('questionOptions') || [];
    const allSubjects = db.getAll('subjects') || [];
    const allTopics = db.getAll('topics') || [];
    const allCompanies = db.getAll('companies') || [];

    const subjectMap = new Map(allSubjects.map(s => [s.id, s]));
    const topicMap = new Map(allTopics.map(t => [t.id, t]));
    const companyMap = new Map(allCompanies.map(c => [c.id, c]));
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    // Calculate aggregated statistics
    const totalRecorded = vaultItems.length;
    const unresolvedCount = vaultItems.filter(item => item.mastery_status === 'unresolved').length;
    const masteredCount = vaultItems.filter(item => item.mastery_status === 'mastered').length;
    const masteryRate = totalRecorded > 0 ? Math.round((masteredCount / totalRecorded) * 100) : 0;

    // Build subject summary breakdown
    const subjectStatsMap = new Map();

    const enrichedList = [];

    for (const item of vaultItems) {
      const q = questionMap.get(item.question_id);
      if (!q) continue;

      const subject = subjectMap.get(q.subject_id) || { id: q.subject_id, name: 'General Engineering' };
      const topic = topicMap.get(q.topic_id) || { id: q.topic_id, name: 'Syllabus Core' };
      const company = q.company_id ? companyMap.get(q.company_id) : null;
      const qOptions = allOptions.filter(o => o.question_id === q.id);

      // Subject summary tally
      if (!subjectStatsMap.has(subject.id)) {
        subjectStatsMap.set(subject.id, {
          id: subject.id,
          name: subject.name,
          total: 0,
          unresolved: 0,
          mastered: 0
        });
      }
      const sStat = subjectStatsMap.get(subject.id);
      sStat.total += 1;
      if (item.mastery_status === 'unresolved') sStat.unresolved += 1;
      else sStat.mastered += 1;

      // Filter by status if specified
      if (status === 'unresolved' && item.mastery_status !== 'unresolved') continue;
      if (status === 'mastered' && item.mastery_status !== 'mastered') continue;

      // Filter by subject
      if (subjectId && subjectId !== 'all' && q.subject_id !== subjectId) continue;

      // Filter by search query
      if (search && search.trim()) {
        const query = search.toLowerCase();
        const matchesQ = (q.question || '').toLowerCase().includes(query);
        const matchesTopic = (topic.name || '').toLowerCase().includes(query);
        const matchesSubject = (subject.name || '').toLowerCase().includes(query);
        if (!matchesQ && !matchesTopic && !matchesSubject) continue;
      }

      // Generate deep reasoning
      const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (item.last_chosen_answer || '').toUpperCase());
      const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
      const explanationDetails = QuizEngine.explainMistakeDetails(q, item.last_chosen_answer, chosenOpt, correctOpt, subject, topic);

      enrichedList.push({
        vault_id: item.id,
        question_id: q.id,
        question: q.question,
        question_type: q.question_type || 'MULTIPLE_CHOICE',
        difficulty: q.difficulty || 'Medium',
        expected_time: q.expected_time || 60,
        xp_value: q.xp_value || 20,
        subject_id: subject.id,
        subject_name: subject.name,
        topic_id: topic.id,
        topic_name: topic.name,
        company_name: company?.name || null,
        options: qOptions.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text,
          is_correct: (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase()
        })),
        correct_answer: q.correct_answer,
        correct_text: explanationDetails.correctText,
        last_chosen_answer: item.last_chosen_answer,
        last_chosen_text: explanationDetails.chosenText,
        why_incorrect: explanationDetails.whyIncorrect,
        why_correct: explanationDetails.whyCorrect,
        explanation: q.explanation,
        mistake_count: item.mistake_count || 1,
        mastery_status: item.mastery_status || 'unresolved',
        mastered_at: item.mastered_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
    }

    // Sort: Unresolved first, then highest mistake count, then newest
    enrichedList.sort((a, b) => {
      if (a.mastery_status !== b.mastery_status) {
        return a.mastery_status === 'unresolved' ? -1 : 1;
      }
      if (b.mistake_count !== a.mistake_count) {
        return b.mistake_count - a.mistake_count;
      }
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

    return {
      stats: {
        total_recorded: totalRecorded,
        unresolved_count: unresolvedCount,
        mastered_count: masteredCount,
        mastery_rate: masteryRate
      },
      subjects: Array.from(subjectStatsMap.values()),
      count: enrichedList.length,
      mistakes: enrichedList
    };
  }

  /**
   * Generates a targeted Revision Drill session from the candidate's unresolved mistakes.
   */
  static generateRevisionDrill(userId, { count = 5, subjectId = null } = {}) {
    this.syncHistoricalAttempts(userId);

    const vaultItems = db.find('mistakeVault', mv => mv.user_id === userId && mv.mastery_status === 'unresolved') || [];
    if (vaultItems.length === 0) {
      return {
        success: false,
        message: 'No unresolved mistakes found! You have cleared all logged errors.'
      };
    }

    const allQuestions = db.getAll('questions') || [];
    const allOptions = db.getAll('questionOptions') || [];
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    // Filter by subject if requested
    let candidateItems = vaultItems;
    if (subjectId && subjectId !== 'all') {
      candidateItems = candidateItems.filter(item => {
        const q = questionMap.get(item.question_id);
        return q && q.subject_id === subjectId;
      });
    }

    if (candidateItems.length === 0) {
      return {
        success: false,
        message: 'No unresolved mistakes found matching the selected subject filter.'
      };
    }

    // Sort prioritizing highest mistake counts and oldest mistakes (spaced repetition)
    candidateItems.sort((a, b) => {
      if ((b.mistake_count || 1) !== (a.mistake_count || 1)) {
        return (b.mistake_count || 1) - (a.mistake_count || 1);
      }
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

    const selectedVaultItems = candidateItems.slice(0, Math.min(count, candidateItems.length));
    const sessionId = `session-drill-${crypto.randomUUID()}`;

    const session = {
      id: sessionId,
      user_id: userId,
      mode: 'MISTAKE_DRILL',
      status: 'IN_PROGRESS',
      total_questions: selectedVaultItems.length,
      correct_count: 0,
      score: 0.0,
      xp_earned: 0,
      time_taken_seconds: 0,
      config_params: { count, subjectId },
      created_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('quizSessions', session);

    const questionsList = [];

    selectedVaultItems.forEach((item, idx) => {
      const q = questionMap.get(item.question_id);
      if (!q) return;

      db.insert('quizQuestions', {
        id: `qq-${sessionId}-${idx + 1}`,
        session_id: sessionId,
        question_id: q.id,
        sequence_order: idx + 1,
        user_answer: null,
        is_correct: null,
        time_spent_seconds: 0
      });

      const subject = db.get('subjects', q.subject_id);
      const topic = db.get('topics', q.topic_id);
      const company = q.company_id ? db.get('companies', q.company_id) : null;
      const options = allOptions.filter(o => o.question_id === q.id);

      questionsList.push({
        id: q.id,
        sequence: idx + 1,
        question: q.question,
        question_type: q.question_type || 'MULTIPLE_CHOICE',
        difficulty: q.difficulty || 'Medium',
        subject_name: subject?.name || 'Computer Science',
        topic_name: topic?.name || 'Core Concept',
        company_name: company?.name || 'Campus Benchmark',
        expected_time: q.expected_time || 60,
        xp_value: (q.xp_value || 20) + 10, // Revision mastery bonus
        previous_mistake_count: item.mistake_count || 1,
        last_chosen_answer: item.last_chosen_answer,
        options: options.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text
        }))
      });
    });

    return {
      success: true,
      session_id: sessionId,
      mode: 'MISTAKE_DRILL',
      total_questions: questionsList.length,
      duration_minutes: Math.max(3, Math.ceil(questionsList.length * 1.5)),
      questions: questionsList
    };
  }

  /**
   * Evaluates answers submitted for a Revision Drill session,
   * updates the mistake vault to 'mastered' on correct answers,
   * and awards bonus XP.
   */
  static submitRevisionDrill(userId, sessionId, answers = [], totalTimeTaken = 0) {
    const session = db.get('quizSessions', sessionId);
    if (!session) throw new Error('Revision drill session not found');

    if (session.user_id !== userId) {
      throw new Error('Unauthorized submission');
    }

    const allQuestions = db.getAll('questions') || [];
    const allOptions = db.getAll('questionOptions') || [];
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));
    const answersMap = new Map(answers.map(a => [a.question_id, a]));

    const sessionQuestions = db.find('quizQuestions', qq => qq.session_id === sessionId) || [];
    let correctCount = 0;
    let newlyMasteredCount = 0;
    let earnedXp = 0;
    const graded = [];

    for (const qq of sessionQuestions) {
      const q = questionMap.get(qq.question_id);
      if (!q) continue;

      const userAnsObj = answersMap.get(q.id);
      const chosenAnswer = userAnsObj?.answer || userAnsObj?.chosen_option || userAnsObj?.chosen_answer || '';
      const timeSpent = userAnsObj?.time_spent || 30;

      const isCorr = chosenAnswer.trim().toUpperCase() === (q.correct_answer || '').trim().toUpperCase();
      let questionXp = 0;

      const subject = db.get('subjects', q.subject_id);
      const topic = db.get('topics', q.topic_id);
      const qOptions = allOptions.filter(o => o.question_id === q.id);
      const chosenOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === chosenAnswer.toUpperCase());
      const correctOpt = qOptions.find(o => (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase());
      const details = QuizEngine.explainMistakeDetails(q, chosenAnswer, chosenOpt, correctOpt, subject, topic);

      const mvId = `mv-${userId}-${q.id}`;
      const existingMv = db.get('mistakeVault', mvId);

      if (isCorr) {
        correctCount += 1;
        newlyMasteredCount += 1;
        questionXp = (q.xp_value || 20) + 15; // Mastery bonus
        earnedXp += questionXp;

        // Mark as mastered in Mistake Vault!
        if (existingMv) {
          db.update('mistakeVault', mvId, {
            mastery_status: 'mastered',
            mastered_at: new Date().toISOString(),
            last_chosen_answer: chosenAnswer,
            updated_at: new Date().toISOString()
          });
        }
      } else {
        // Still incorrect
        questionXp = 5; // Attempt credit
        earnedXp += questionXp;

        if (existingMv) {
          db.update('mistakeVault', mvId, {
            mistake_count: (existingMv.mistake_count || 1) + 1,
            last_chosen_answer: chosenAnswer,
            mastery_status: 'unresolved',
            updated_at: new Date().toISOString()
          });
        }
      }

      // Record attempt
      const attemptId = `att-drill-${crypto.randomUUID()}`;
      db.insert('attempts', {
        id: attemptId,
        user_id: userId,
        question_id: q.id,
        session_id: sessionId,
        user_answer: chosenAnswer,
        is_correct: isCorr,
        time_spent_seconds: timeSpent,
        xp_gained: questionXp,
        attempted_at: new Date().toISOString()
      });

      // Update quiz question join record
      db.update('quizQuestions', qq.id, {
        user_answer: chosenAnswer,
        is_correct: isCorr,
        time_spent_seconds: timeSpent
      });

      graded.push({
        question_id: q.id,
        sequence: qq.sequence_order,
        question: q.question,
        chosen_answer: chosenAnswer,
        chosen_text: details.chosenText,
        correct_answer: q.correct_answer,
        correct_text: details.correctText,
        is_correct: isCorr,
        is_mastered_now: isCorr,
        why_correct: details.whyCorrect,
        why_incorrect: details.whyIncorrect,
        explanation: q.explanation,
        options: qOptions.map(o => ({
          option_key: o.option_key,
          option_text: o.option_text,
          is_correct: (o.option_key || '').toUpperCase() === (q.correct_answer || '').toUpperCase()
        })),
        subject_name: subject?.name || 'Engineering',
        topic_name: topic?.name || 'Syllabus'
      });
    }

    const accuracyRate = sessionQuestions.length > 0
      ? Math.round((correctCount / sessionQuestions.length) * 100)
      : 0;

    // Update session record
    db.update('quizSessions', sessionId, {
      status: 'COMPLETED',
      correct_count: correctCount,
      score: accuracyRate,
      xp_earned: earnedXp,
      time_taken_seconds: totalTimeTaken,
      completed_at: new Date().toISOString()
    });

    // Update user total XP and levels
    const user = db.get('users', userId);
    if (user) {
      const newXp = (user.total_xp || 0) + earnedXp;
      user.total_xp = newXp;
      user.current_level = Math.floor(newXp / 250) + 1;
      db.update('users', userId, user);

      db.insert('xpHistory', {
        id: `xp-${crypto.randomUUID()}`,
        user_id: userId,
        amount: earnedXp,
        reason: `Revision Drill: Mastered ${newlyMasteredCount} mistakes (${accuracyRate}% accuracy)`,
        created_at: new Date().toISOString()
      });
    }

    return {
      session_id: sessionId,
      status: 'COMPLETED',
      total_questions: sessionQuestions.length,
      correct_count: correctCount,
      newly_mastered_count: newlyMasteredCount,
      accuracy_rate: accuracyRate,
      xp_earned: earnedXp,
      time_taken_seconds: totalTimeTaken,
      graded_questions: graded
    };
  }

  /**
   * Toggles mastery status manually for a specific mistake.
   */
  static toggleMastery(userId, questionId) {
    const mvId = `mv-${userId}-${questionId}`;
    let item = db.get('mistakeVault', mvId);

    if (!item) {
      // Create it if student marked it manually
      const q = db.get('questions', questionId);
      if (!q) throw new Error('Question not found');

      item = {
        id: mvId,
        user_id: userId,
        question_id: questionId,
        source_type: 'manual',
        last_attempt_id: null,
        last_chosen_answer: '',
        mistake_count: 1,
        mastery_status: 'mastered',
        mastered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.insert('mistakeVault', item);
      return { success: true, mastery_status: 'mastered' };
    }

    const newStatus = item.mastery_status === 'mastered' ? 'unresolved' : 'mastered';
    db.update('mistakeVault', mvId, {
      mastery_status: newStatus,
      mastered_at: newStatus === 'mastered' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    });

    return { success: true, mastery_status: newStatus };
  }
}

export default MistakeVaultService;
