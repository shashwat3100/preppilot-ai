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

    const allQuestions = db.getAll('questions');
    const allOptions = db.getAll('questionOptions');
    const userAttempts = db.find('attempts', a => a.user_id === userId);
    const userPerf = db.find('studentPerformance', p => p.user_id === userId);

    // Build performance lookup maps
    const topicWeaknessMap = new Map();
    userPerf.forEach(p => {
      topicWeaknessMap.set(p.topic_id, p.weakness_score || 0.5);
    });

    const attemptedQuestionIds = new Set(userAttempts.map(a => a.question_id));
    const questionLastAttemptTime = new Map();
    userAttempts.forEach(a => {
      const prev = questionLastAttemptTime.get(a.question_id) || 0;
      const current = new Date(a.attempted_at).getTime();
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
      // Intermediate student -> Medium preferred (10 pts), Easy (7 pts), Hard (6 pts)
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

      // 5. Unattempted Priority (0 to 15 points)
      const hasAttempted = attemptedQuestionIds.has(q.id);
      if (!hasAttempted) {
        unattemptedScore = 15;
      } else {
        // Check if previous attempt was incorrect
        const latestAttempt = userAttempts
          .filter(a => a.question_id === q.id)
          .sort((a, b) => new Date(b.attempted_at) - new Date(a.attempted_at))[0];

        if (latestAttempt && !latestAttempt.is_correct) {
          unattemptedScore = 12; // Revise failed questions
        } else {
          unattemptedScore = 2; // Already mastered
        }
      }

      // 6. Recency / Spaced Repetition (0 to 5 points)
      if (hasAttempted) {
        const lastTime = questionLastAttemptTime.get(q.id);
        const hoursAgo = (Date.now() - lastTime) / (1000 * 3600);
        if (hoursAgo > 72) {
          // Ready for spaced repetition review
          recencyScore = 5;
        } else {
          recencyScore = 1;
        }
      } else {
        recencyScore = 4;
      }

      // Total Weighted Score (0 to 105 max, normalized to 100)
      const totalScore = Math.min(100, Math.round(topicScore + companyScore + branchScore + difficultyScore + unattemptedScore + recencyScore));

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

    // Sort by highest recommendation score first
    filtered.sort((a, b) => b.recommendation_score - a.recommendation_score);

    return filtered.slice(0, limit);
  }

  static generateReason({ topicScore, companyScore, unattemptedScore, topicName, companyName, isWeak }) {
    if (isWeak && topicName) {
      return `Targeted for revision: Your past accuracy in ${topicName} needs reinforcement.`;
    }
    if (companyScore >= 20 && companyName) {
      return `High priority for your target recruitment drive: ${companyName} pattern question.`;
    }
    if (unattemptedScore >= 14) {
      return `Fresh curriculum question matched to your engineering branch profile.`;
    }
    return `Balanced adaptive practice item to broaden your technical interview readiness.`;
  }
}

export default RecommendationEngine;
