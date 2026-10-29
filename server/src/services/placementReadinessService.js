/**
 * Placement Readiness Diagnostic & Recruiter Benchmark Service
 * 
 * Provides a canonical, unified calculation of Placement Readiness score,
 * cohort percentile ranking, tier fit classification, and recruiter eligibility matrix.
 * Used across Student Dashboard, Performance Analytics, and Admin/Faculty portals
 * to guarantee 100% cross-platform consistency.
 */

export const RECRUITER_BENCHMARKS = [
  {
    company_id: 'comp-tcs',
    company_name: 'TCS (NQT Ninja / Digital / Prime)',
    cutoff_accuracy: 60,
    min_coding_solved: 2,
    tier: 'Service / Digital IT'
  },
  {
    company_id: 'comp-infosys',
    company_name: 'Infosys (SE / DSE / SP)',
    cutoff_accuracy: 65,
    min_coding_solved: 2,
    tier: 'Service / Digital IT'
  },
  {
    company_id: 'comp-accenture',
    company_name: 'Accenture (ASE / Cloud Associate)',
    cutoff_accuracy: 65,
    min_coding_solved: 2,
    tier: 'Consulting & IT'
  },
  {
    company_id: 'comp-wipro',
    company_name: 'Wipro (Elite NTH / Turbo)',
    cutoff_accuracy: 60,
    min_coding_solved: 2,
    tier: 'IT Services'
  },
  {
    company_id: 'comp-deloitte',
    company_name: 'Deloitte (Technology Analyst)',
    cutoff_accuracy: 72,
    min_coding_solved: 3,
    tier: 'Consulting'
  },
  {
    company_id: 'comp-amazon',
    company_name: 'Amazon (SDE-1 Campus)',
    cutoff_accuracy: 80,
    min_coding_solved: 5,
    tier: 'Product (Tier-1)'
  },
  {
    company_id: 'comp-microsoft',
    company_name: 'Microsoft (Software Engineer)',
    cutoff_accuracy: 82,
    min_coding_solved: 5,
    tier: 'Product (Tier-1)'
  },
  {
    company_id: 'comp-google',
    company_name: 'Google (Software Engineer L3)',
    cutoff_accuracy: 85,
    min_coding_solved: 6,
    tier: 'Product (Tier-1)'
  }
];

/**
 * Computes recruiter eligibility matrix based on user accuracy, company-specific attempts, and coding clearance
 */
export function getRecruiterEligibility(overallAccuracy, codingSolvedCount, totalSubmissions, hasActivity, companyAccuracy = []) {
  return RECRUITER_BENCHMARKS.map(bm => {
    if (!hasActivity) {
      return {
        company_name: bm.company_name,
        tier: bm.tier,
        cutoff_accuracy: bm.cutoff_accuracy,
        min_coding_solved: bm.min_coding_solved,
        current_accuracy: 0,
        current_coding_solved: 0,
        status: 'NEEDS_PREPARATION',
        match_score: 0,
        stage: 'Pending Assessment',
        verdict: 'Complete initial diagnostic assessment to evaluate recruiter cutoffs.'
      };
    }

    // Check if candidate practiced this specific company's pattern
    const specific = companyAccuracy.find(c => c.id === bm.company_id || (c.name && bm.company_name.toLowerCase().includes(c.name.toLowerCase())));
    const effectiveAccuracy = (specific && specific.attempted >= 3 && specific.accuracy !== null)
      ? Math.max(overallAccuracy, specific.accuracy)
      : overallAccuracy;

    const meetsAccuracy = effectiveAccuracy >= bm.cutoff_accuracy;
    const meetsCoding = codingSolvedCount >= bm.min_coding_solved;

    let status = 'NEEDS_PREPARATION';
    let matchScore = 0;
    let stage = 'Prep Needed';
    let verdict = '';

    if (meetsAccuracy && meetsCoding) {
      status = 'ELIGIBLE';
      stage = 'Comprehensive Qualified';
      matchScore = Math.min(98, 75 + (effectiveAccuracy - bm.cutoff_accuracy) + (codingSolvedCount - bm.min_coding_solved) * 4);
      verdict = 'Cleared all online aptitude and coding thresholds for campus shortlisting.';
    } else if (meetsAccuracy) {
      // If aptitude cutoff is cleared:
      // Service / IT consulting companies: eligible for screening round!
      if (bm.tier.includes('Service') || bm.tier.includes('Consulting') || bm.tier.includes('IT')) {
        status = 'ELIGIBLE';
        stage = 'Screening Round Qualified';
        matchScore = Math.min(92, 72 + (effectiveAccuracy - bm.cutoff_accuracy) * 2);
        verdict = `Screening cutoff cleared (${effectiveAccuracy}% vs ${bm.cutoff_accuracy}% cutoff). Solve coding problems for higher salary band upgrades.`;
      } else {
        // Tier-1 Product:
        status = 'BORDERLINE';
        stage = 'Aptitude Qualified · Coding Pending';
        matchScore = Math.min(68, 55 + (effectiveAccuracy - bm.cutoff_accuracy));
        verdict = `Online screening profile strong (${effectiveAccuracy}%). Requires ${bm.min_coding_solved} DSA solutions for Tier-1 coding round.`;
      }
    } else if (effectiveAccuracy >= bm.cutoff_accuracy - 8) {
      status = 'BORDERLINE';
      stage = 'Near Cutoff';
      matchScore = Math.max(48, Math.min(68, 55 - (bm.cutoff_accuracy - effectiveAccuracy) * 2));
      verdict = `Close to cutoff (${effectiveAccuracy}% vs ${bm.cutoff_accuracy}% required). Focus on priority remediation topics to qualify.`;
    } else {
      status = 'NEEDS_PREPARATION';
      stage = 'Core Prep Needed';
      matchScore = Math.max(20, Math.min(45, 35 - (bm.cutoff_accuracy - effectiveAccuracy)));
      verdict = `Requires concept revision in core topics to bridge the ${(bm.cutoff_accuracy - effectiveAccuracy)}% gap.`;
    }

    return {
      company_name: bm.company_name,
      tier: bm.tier,
      cutoff_accuracy: bm.cutoff_accuracy,
      min_coding_solved: bm.min_coding_solved,
      current_accuracy: effectiveAccuracy,
      current_coding_solved: codingSolvedCount,
      status,
      match_score: Math.round(matchScore),
      stage,
      verdict
    };
  });
}

/**
 * Unified Placement Readiness Calculation
 * 
 * @param {Object} params
 * @param {Array} params.attempts - List of quiz/assessment attempts
 * @param {number} [params.currentStreak=0] - Current daily study streak
 * @param {Array} [params.codingSubmissions=[]] - List of coding problem submissions
 * @param {Array} [params.companyAccuracy=[]] - Optional company accuracy array
 * @returns {Object} Canonical placement metrics including score, percentile, tier_fit, etc.
 */
export function calculatePlacementReadiness({ attempts = [], currentStreak = 0, codingSubmissions = [], companyAccuracy = [] }) {
  const totalAttempted = attempts.length;
  const correctCount = attempts.filter(a => a.is_correct).length;
  const incorrectCount = totalAttempted - correctCount;
  const overallAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  // Average time per question
  const totalTimeSpent = attempts.reduce((acc, a) => acc + (a.time_spent_seconds || 0), 0);
  const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalTimeSpent / totalAttempted) : 45;

  // Coding submissions stats
  const totalSubmissions = codingSubmissions.length;
  const acceptedSubmissions = codingSubmissions.filter(s => s.status === 'ACCEPTED').length;
  const codingAcceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
  const solvedProblemIds = new Set(codingSubmissions.filter(s => s.status === 'ACCEPTED').map(s => s.problem_id));
  const attemptedProblemIds = new Set(codingSubmissions.map(s => s.problem_id));
  const codingSolvedCount = solvedProblemIds.size;

  const hasActivity = totalAttempted > 0 || totalSubmissions > 0;

  let readinessScore = 0;
  let cohortPercentile = 0;
  let tierFit = 'Diagnostic Assessment Required';
  let breakdown = {
    accuracy_points: 0,
    velocity_points: 0,
    volume_points: 0,
    consistency_points: 0
  };

  if (hasActivity) {
    if (totalSubmissions === 0) {
      // Phase 1 Placement Screening Assessment (MCQ & CS Core Mastery)
      const accScore = overallAccuracy * 0.50; // up to 50 pts
      const velScore = avgTimePerQuestion <= 30 ? 20 : avgTimePerQuestion <= 45 ? 16 : avgTimePerQuestion <= 60 ? 12 : 6; // up to 20 pts
      const volScore = Math.min(15, Math.round((totalAttempted / 50) * 15)); // up to 15 pts
      const conScore = 8 + Math.min(7, (currentStreak || 1) * 2); // up to 15 pts
      readinessScore = Math.min(99, Math.max(15, Math.round(accScore + velScore + volScore + conScore)));

      breakdown = {
        accuracy_points: Math.round(accScore),
        velocity_points: Math.round(velScore),
        volume_points: Math.round(volScore),
        consistency_points: Math.round(conScore)
      };
    } else {
      // Blended Phase 1 (Screening) + Phase 2 (Technical Coding Arena)
      const accScore = overallAccuracy * 0.30;
      const codingScore = Math.min(30, (codingSolvedCount / 8) * 30);
      const acceptanceScore = (codingAcceptanceRate || 0) * 0.15;
      const velScore = avgTimePerQuestion <= 30 ? 15 : avgTimePerQuestion <= 45 ? 12 : avgTimePerQuestion <= 60 ? 8 : 4;
      const consistencyScore = Math.min(10, ((currentStreak || 0) * 3) + Math.min(5, Math.round((totalAttempted / 50) * 5)));
      readinessScore = Math.min(99, Math.max(15, Math.round(accScore + codingScore + acceptanceScore + velScore + consistencyScore)));

      breakdown = {
        accuracy_points: Math.round(accScore),
        velocity_points: Math.round(velScore),
        volume_points: Math.round(codingScore + acceptanceScore),
        consistency_points: Math.round(consistencyScore)
      };
    }

    cohortPercentile = Math.min(99, Math.max(10, Math.round(readinessScore * 0.95 + 4)));
    tierFit = readinessScore >= 80 
      ? 'Tier-1 Product & Super Dream' 
      : readinessScore >= 70 
      ? 'Premium IT & Consulting' 
      : readinessScore >= 55 
      ? 'Mass IT & Services' 
      : 'Foundation Building';
  }

  const companyEligibility = getRecruiterEligibility(overallAccuracy, codingSolvedCount, totalSubmissions, hasActivity, companyAccuracy);

  return {
    has_activity: hasActivity,
    score: readinessScore,
    percentile: cohortPercentile,
    tier_fit: tierFit,
    overall_accuracy: overallAccuracy,
    avg_time_per_question: avgTimePerQuestion,
    total_attempted: totalAttempted,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    total_time_spent_seconds: totalTimeSpent,
    coding_solved_count: codingSolvedCount,
    coding_attempted_count: attemptedProblemIds.size,
    coding_acceptance_rate: codingAcceptanceRate,
    total_coding_submissions: totalSubmissions,
    company_eligibility: companyEligibility,
    breakdown
  };
}

export default {
  calculatePlacementReadiness,
  getRecruiterEligibility,
  RECRUITER_BENCHMARKS
};
