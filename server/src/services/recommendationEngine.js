import db from '../database/db.js';

/**
 * CareerPrep AI Recommendation Engine
 * Calculates multi-dimensional weighted recommendation score for questions:
 *
 * Total Score =
 *   Topic Weakness (35%)
 *   + Company Relevance (25%)
 *   + Branch Relevance (15%)
 *   + Difficulty Match (10%)
 *   + Unattempted Priority (10%)
 *   + Recency Spaced Revision (5%)
 */
export class RecommendationEngine {
  /**
   * Score and rank candidate questions for a given student
   */
  static getRecommendations(userId, limit = 10, filters = {}) {
    const user = db.get('users', userId);
    if (!user) return [];

    const allQuestions = db.getAll('questions') || [];
    const allOptions = db.getAll('questionOptions') || [];
    const userAttempts = db.find('attempts', a => a.user_id === userId) || [];
    const userPerf = db.find('studentPerformance', p => p.user_id === userId) || [];

    // Track active and past quiz sessions so even questions served in-progress are treated as opted
    const userSessions = db.find('quizSessions', s => s.user_id === userId) || [];
    const userSessionIds = new Set(userSessions.map(s => s.id));
    const userQuizQuestions = db.find('quizQuestions', qq => userSessionIds.has(qq.session_id)) || [];

    // Build performance lookup maps
    const topicWeaknessMap = new Map();
    userPerf.forEach(p => {
      topicWeaknessMap.set(p.topic_id, p.weakness_score || 0.5);
    });

    const attemptedQuestionIds = new Set([
      ...userAttempts.map(a => a.question_id),
      ...userQuizQuestions.map(qq => qq.question_id)
    ]);

    const questionLastAttemptTime = new Map();
    userAttempts.forEach(a => {
      const prev = questionLastAttemptTime.get(a.question_id) || 0;
      const current = new Date(a.attempted_at || a.created_at || 0).getTime();
      if (current > prev) questionLastAttemptTime.set(a.question_id, current);
    });

    // Score each question
    const scoredQuestions = allQuestions.map(q => {
      let topicScore = 0;
      let companyScore = 0;
      let branchScore = 0;
      let difficultyScore = 0;
      let unattemptedScore = 0;
      let recencyScore = 0;

      // 1. Topic Weakness (0 to 35 points)
      // Higher weakness score (closer to 1.0) means student struggles with this topic
      const weakness = topicWeaknessMap.has(q.topic_id) ? topicWeaknessMap.get(q.topic_id) : 0.6; // default moderate priority
      topicScore = weakness * 35;

      // 2. Company Relevance (0 to 25 points)
      // Checks if the question company matches any of the student's target companies
      const userTargetCompanies = user.target_companies || [];
      if (q.company_id && userTargetCompanies.includes(q.company_id)) {
        companyScore = 25;
      } else if (!q.company_id) {
        // Universal core question
        companyScore = 15;
      } else {
        companyScore = 5;
      }

      // 3. Branch Relevance (0 to 15 points)
      if (q.branch_id === user.branch_id) {
        branchScore = 15;
      } else if (!q.branch_id) {
        branchScore = 10;
      } else {
        branchScore = 3;
      }

      // 4. Difficulty Match (0 to 10 points)
      const userSkill = user.skill_level || 'Intermediate';
      if (userSkill === 'Beginner') {
        if (q.difficulty === 'Easy') difficultyScore = 10;
        else if (q.difficulty === 'Medium') difficultyScore = 6;
        else difficultyScore = 3;
      } else if (userSkill === 'Advanced') {
        if (q.difficulty === 'Hard') difficultyScore = 10;
        else if (q.difficulty === 'Medium') difficultyScore = 8;
        else difficultyScore = 4;
      } else {
        // Intermediate
        if (q.difficulty === 'Medium') difficultyScore = 10;
        else if (q.difficulty === 'Easy') difficultyScore = 7;
        else difficultyScore = 7;
      }

      // 5. Unattempted Priority (0 to 50 points)
      // Crucial: Fresh unattempted questions receive a dominant boost so they always outrank attempted items
      const hasAttempted = attemptedQuestionIds.has(q.id);
      if (!hasAttempted) {
        unattemptedScore = 50; // Decisive priority for brand new questions
      } else {
        // Check if previous attempt was incorrect
        const latestAttempt = userAttempts
          .filter(a => a.question_id === q.id)
          .sort((a, b) => new Date(b.attempted_at || b.created_at || 0) - new Date(a.attempted_at || a.created_at || 0))[0];

        if (latestAttempt && !latestAttempt.is_correct) {
          unattemptedScore = 15; // Spaced revision for mistaken concepts
        } else {
          unattemptedScore = 0; // Already mastered; deprioritize to prevent repetitions
        }
      }

      // 6. Recency / Spaced Repetition (0 to 10 points)
      if (hasAttempted) {
        const lastTime = questionLastAttemptTime.get(q.id) || 0;
        const hoursAgo = (Date.now() - lastTime) / (1000 * 3600);
        if (hoursAgo > 168) {
          // Attempted more than 7 days ago, eligible for spaced repetition
          recencyScore = 5;
        } else {
          recencyScore = 0;
        }
      } else {
        recencyScore = 10; // Fresh questions get full recency advantage
      }

      // Total Weighted Score (0 to 145 max, normalized to 100)
      const totalScore = Math.min(100, Math.round(
        ((topicScore + companyScore + branchScore + difficultyScore + unattemptedScore + recencyScore) / 145) * 100
      ));

      // Subject and Topic details for rich UI cards
      const subject = db.get('subjects', q.subject_id);
      const topic = db.get('topics', q.topic_id);
      const company = q.company_id ? db.get('companies', q.company_id) : null;
      const options = allOptions.filter(o => o.question_id === q.id);

      return {
        ...q,
        options,
        subject_name: subject?.name || 'Computer Science',
        topic_name: topic?.name || 'General Concept',
        company_name: company?.name || 'Multi-Company Pattern',
        is_unattempted: !hasAttempted,
        has_attempted: hasAttempted,
        recommendation_score: totalScore,
        score_breakdown: {
          topic_weakness: Math.round(topicScore),
          company_relevance: Math.round(companyScore),
          branch_relevance: Math.round(branchScore),
          difficulty_match: Math.round(difficultyScore),
          unattempted_priority: Math.round(unattemptedScore),
          spaced_repetition: Math.round(recencyScore)
        },
        recommendation_reason: RecommendationEngine.generateReason({
          isUnattempted: !hasAttempted,
          topicScore,
          companyScore,
          unattemptedScore,
          topicName: topic?.name,
          companyName: company?.name,
          isWeak: weakness > 0.6
        })
      };
    });

    // Apply optional runtime filters
    let filtered = scoredQuestions;
    if (filters.branch_id) filtered = filtered.filter(q => q.branch_id === filters.branch_id);
    if (filters.company_id) filtered = filtered.filter(q => q.company_id === filters.company_id);
    if (filters.subject_id) filtered = filtered.filter(q => q.subject_id === filters.subject_id);
    if (filters.difficulty) filtered = filtered.filter(q => q.difficulty === filters.difficulty);

    // Sort strictly: Fresh unattempted questions FIRST, then by highest recommendation score with entropy tie-breaking
    filtered.sort((a, b) => {
      if (a.is_unattempted !== b.is_unattempted) {
        return a.is_unattempted ? -1 : 1;
      }
      const diff = b.recommendation_score - a.recommendation_score;
      if (Math.abs(diff) <= 2) {
        return Math.random() - 0.5; // Break deterministic ties to rotate fresh questions
      }
      return diff;
    });

    // If no single subject is requested, diversify across distinct subjects to prevent clustering in one topic
    if (!filters.subject_id && !filters.topic_id && filtered.length > limit) {
      const unattempted = filtered.filter(q => q.is_unattempted);
      const attempted = filtered.filter(q => !q.is_unattempted);

      const diversifyPool = (pool, targetCount) => {
        const bySubject = new Map();
        pool.forEach(q => {
          const key = q.subject_id || 'other';
          if (!bySubject.has(key)) bySubject.set(key, []);
          bySubject.get(key).push(q);
        });

        // Shuffle subject groups order so different subjects take lead
        const subjectKeys = [...bySubject.keys()].sort(() => 0.5 - Math.random());
        const result = [];
        let index = 0;
        let addedInRound = true;

        while (result.length < targetCount && addedInRound) {
          addedInRound = false;
          for (const key of subjectKeys) {
            const list = bySubject.get(key);
            if (index < list.length) {
              result.push(list[index]);
              addedInRound = true;
              if (result.length >= targetCount) break;
            }
          }
          index++;
        }
        return result;
      };

      if (unattempted.length >= limit) {
        return diversifyPool(unattempted, limit);
      } else {
        const selected = diversifyPool(unattempted, unattempted.length);
        const remainder = limit - selected.length;
        const selectedIds = new Set(selected.map(q => q.id));
        const remAttempted = attempted.filter(q => !selectedIds.has(q.id));
        return [...selected, ...diversifyPool(remAttempted, remainder)];
      }
    }

    return filtered.slice(0, limit);
  }

  static generateReason({ isUnattempted, topicScore, companyScore, unattemptedScore, topicName, companyName, isWeak }) {
    if (isUnattempted) {
      if (companyScore >= 20 && companyName) {
        return `Fresh, unattempted question matching ${companyName} placement interview patterns.`;
      }
      if (isWeak && topicName) {
        return `New challenge in ${topicName} to strengthen your detected weak concept.`;
      }
      return `Brand-new curriculum question aligned with your engineering branch.`;
    }

    if (isWeak && topicName) {
      return `Targeted for revision: Your past accuracy in ${topicName} needs reinforcement.`;
    }
    if (companyScore >= 20 && companyName) {
      return `High priority for your target recruitment drive: ${companyName} pattern question.`;
    }
    return `Spaced repetition review to reinforce long-term conceptual retention.`;
  }
}

export default RecommendationEngine;
