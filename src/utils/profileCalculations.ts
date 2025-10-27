import { WeeklyStats, UserSummary, ProfileKPI, WeekPerformance } from '../types/profile';

/**
 * Profile Calculation Utilities
 * Functions for transforming API data and calculating KPIs
 */

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

/**
 * Normalize snake_case API response to camelCase
 * Handles both single-wrapped and double-wrapped responses
 */
export function normalizeSummaryResponse(response: any): UserSummary {
  console.log('[ProfileCalc] normalizeSummaryResponse input:', JSON.stringify(response, null, 2));

  // Handle double-wrapped response: { data: { data: { ... } } }
  const rawData = response.data?.data || response.data || response;
  console.log('[ProfileCalc] Extracted rawData:', JSON.stringify(rawData, null, 2));
  console.log('[ProfileCalc] Raw weekly_stats:', rawData.weekly_stats);

  const weeklyStats: WeeklyStats[] = (rawData.weekly_stats || []).map((week: any) => {
    // IMPORTANT: Backend sometimes reports total_predictions: 0 incorrectly
    // When there are unfinished matches (result: null), it doesn't count them
    // So we calculate the ACTUAL count from the predictions array
    const actualTotalPredictions = week.predictions?.length || week.total_predictions || 0;

    // Also recalculate correct predictions by counting is_correct: true
    const actualCorrectPredictions = week.predictions?.filter((p: any) => p.is_correct === true).length || week.correct_predictions || 0;

    // Recalculate accuracy based on FINISHED matches only
    const finishedPredictions = week.predictions?.filter((p: any) => p.result !== null) || [];
    const finishedCorrect = finishedPredictions.filter((p: any) => p.is_correct === true).length;
    const actualAccuracy = finishedPredictions.length > 0
      ? (finishedCorrect / finishedPredictions.length) * 100
      : 0;

    console.log(`[ProfileCalc] Week ${week.week}: predictions=${actualTotalPredictions}, finished=${finishedPredictions.length}, correct=${actualCorrectPredictions}, accuracy=${actualAccuracy.toFixed(1)}%`);

    return {
      week: week.week,
      totalPredictions: actualTotalPredictions,
      correctPredictions: actualCorrectPredictions,
      accuracy: actualAccuracy,
      points: week.points,
    };
  });

  console.log('[ProfileCalc] Mapped weeklyStats:', weeklyStats);

  const normalized = {
    userId: rawData.user_id,
    totalPredictions: rawData.total_predictions,
    correctPredictions: rawData.correct_predictions,
    overallAccuracy: rawData.overall_success_rate,
    weeklyStats,
  };

  console.log('[ProfileCalc] Returning normalized:', normalized);
  return normalized;
}

/**
 * Extract first name from full name
 * Falls back to email local part if no name provided
 */
export function extractDisplayName(fullName: string | null, email: string): string {
  if (fullName && fullName.trim().length > 0) {
    // Take first word from full name
    const firstName = fullName.trim().split(/\s+/)[0];
    return firstName;
  }

  // Fallback to email local part (before @)
  const emailLocal = email.split('@')[0];
  return emailLocal;
}

// ============================================================================
// KPI CALCULATIONS
// ============================================================================

/**
 * Calculate weeks played (weeks where user made at least 1 prediction)
 */
export function calculateWeeksPlayed(weeklyStats: WeeklyStats[]): number {
  return weeklyStats.filter((week) => week.totalPredictions > 0).length;
}

/**
 * Calculate weighted average accuracy
 * More accurate than simple average of weekly percentages
 * Weeks with more predictions weigh more heavily
 */
export function calculateWeightedAverage(weeklyStats: WeeklyStats[]): number {
  const played = weeklyStats.filter((w) => w.totalPredictions > 0);

  if (played.length === 0) {
    return 0;
  }

  const totals = played.reduce(
    (acc, week) => {
      acc.finished += week.totalPredictions;
      acc.correct += week.correctPredictions;
      return acc;
    },
    { finished: 0, correct: 0 }
  );

  return totals.finished > 0 ? (totals.correct / totals.finished) * 100 : 0;
}

/**
 * Find best week (highest accuracy)
 * Tie-breaking rules:
 * 1. Highest accuracy percentage
 * 2. If tied: Most correct predictions
 * 3. If still tied: Earliest week number
 */
export function findBestWeek(weeklyStats: WeeklyStats[]): WeekPerformance {
  const played = weeklyStats.filter((w) => w.totalPredictions > 0);

  if (played.length === 0) {
    return { pct: formatItalianPercentage(0), week: 1 };
  }

  const best = [...played].sort((a, b) => {
    // Higher accuracy wins
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }

    // More correct predictions wins
    const correctDiff = b.correctPredictions - a.correctPredictions;
    if (correctDiff !== 0) {
      return correctDiff;
    }

    // Earlier week wins
    return a.week - b.week;
  })[0];

  return {
    pct: formatItalianPercentage(best.accuracy),
    week: best.week,
  };
}

/**
 * Find worst week (lowest accuracy)
 * Tie-breaking rules:
 * 1. Lowest accuracy percentage
 * 2. If tied: Fewest correct predictions
 * 3. If still tied: Earliest week number
 */
export function findWorstWeek(weeklyStats: WeeklyStats[]): WeekPerformance {
  const played = weeklyStats.filter((w) => w.totalPredictions > 0);

  if (played.length === 0) {
    return { pct: formatItalianPercentage(0), week: 1 };
  }

  const worst = [...played].sort((a, b) => {
    // Lower accuracy wins (worst)
    if (a.accuracy !== b.accuracy) {
      return a.accuracy - b.accuracy;
    }

    // Fewer correct predictions wins (worst)
    const correctDiff = a.correctPredictions - b.correctPredictions;
    if (correctDiff !== 0) {
      return correctDiff;
    }

    // Earlier week wins
    return a.week - b.week;
  })[0];

  return {
    pct: formatItalianPercentage(worst.accuracy),
    week: worst.week,
  };
}

/**
 * Format percentage in Italian locale
 * Uses comma as decimal separator (e.g., "65,5%")
 * Max 1 decimal place
 */
export function formatItalianPercentage(value: number): string {
  return `${value.toLocaleString('it-IT', { maximumFractionDigits: 1 })}%`;
}

/**
 * Calculate all KPIs from user summary
 * Main function to generate display data for profile screen
 */
export function calculateProfileKPIs(summary: UserSummary | null): ProfileKPI {
  console.log('[ProfileCalc] calculateProfileKPIs called with summary:', summary);

  if (!summary || summary.weeklyStats.length === 0) {
    console.log('[ProfileCalc] No summary or empty weekly stats, returning defaults');
    return {
      average: formatItalianPercentage(0),
      weeksPlayed: 0,
      best: { pct: formatItalianPercentage(0), week: 1 },
      worst: { pct: formatItalianPercentage(0), week: 1 },
    };
  }

  console.log('[ProfileCalc] Processing weekly stats:', summary.weeklyStats);

  const weeksPlayed = calculateWeeksPlayed(summary.weeklyStats);
  console.log('[ProfileCalc] Weeks played:', weeksPlayed);

  const average = calculateWeightedAverage(summary.weeklyStats);
  console.log('[ProfileCalc] Average:', average);

  const best = findBestWeek(summary.weeklyStats);
  console.log('[ProfileCalc] Best week:', best);

  const worst = findWorstWeek(summary.weeklyStats);
  console.log('[ProfileCalc] Worst week:', worst);

  return {
    average: formatItalianPercentage(average),
    weeksPlayed,
    best,
    worst,
  };
}

// ============================================================================
// AVATAR UTILITIES
// ============================================================================

/**
 * Convert avatar response to data URL for display
 */
export function avatarToDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Get avatar initial from name or email
 */
export function getAvatarInitial(displayName: string, email: string): string {
  const name = displayName || email;
  return name[0]?.toUpperCase() || 'U';
}

// ============================================================================
// SHARE UTILITIES
// ============================================================================

/**
 * Generate share message text for profile
 */
export function generateShareMessage(kpi: ProfileKPI): string {
  return `Il mio punteggio medio su Swipick è ${kpi.average} su ${kpi.weeksPlayed} giornate, il mio risultato migliore è ${kpi.best.pct}. Sai fare meglio?`;
}
