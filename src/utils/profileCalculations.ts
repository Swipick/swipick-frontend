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
  // Handle double-wrapped response: { data: { data: { ... } } }
  const rawData = response.data?.data || response.data || response;

  const weeklyStats: WeeklyStats[] = (rawData.weekly_stats || []).map((week: any) => {
    // Check if backend provides detailed predictions array
    const hasPredictionsArray = Array.isArray(week.predictions) && week.predictions.length > 0;

    let actualTotalPredictions: number;
    let actualCorrectPredictions: number;
    let actualAccuracy: number;

    if (hasPredictionsArray) {
      // Calculate from predictions array (when available)
      actualTotalPredictions = week.predictions.length;
      actualCorrectPredictions = week.predictions.filter((p: any) => p.is_correct === true).length;

      // Recalculate accuracy based on FINISHED matches only
      const finishedPredictions = week.predictions.filter((p: any) => p.result !== null);
      const finishedCorrect = finishedPredictions.filter((p: any) => p.is_correct === true).length;
      actualAccuracy = finishedPredictions.length > 0
        ? (finishedCorrect / finishedPredictions.length) * 100
        : 0;
    } else {
      // Use backend-provided values (summary endpoint)
      actualTotalPredictions = week.total_predictions || 0;
      actualCorrectPredictions = week.correct_predictions || 0;
      // Use success_rate from backend (already calculated correctly)
      actualAccuracy = week.success_rate || 0;
    }

    return {
      week: week.week,
      totalPredictions: actualTotalPredictions,
      correctPredictions: actualCorrectPredictions,
      accuracy: actualAccuracy,
      points: week.points,
    };
  });

  return {
    userId: rawData.user_id,
    totalPredictions: rawData.total_predictions,
    correctPredictions: rawData.correct_predictions,
    overallAccuracy: rawData.overall_success_rate,
    weeklyStats,
  };
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
  if (!summary || summary.weeklyStats.length === 0) {
    return {
      average: formatItalianPercentage(0),
      weeksPlayed: 0,
      best: { pct: formatItalianPercentage(0), week: 1 },
      worst: { pct: formatItalianPercentage(0), week: 1 },
    };
  }

  const weeksPlayed = calculateWeeksPlayed(summary.weeklyStats);
  const average = calculateWeightedAverage(summary.weeklyStats);
  const best = findBestWeek(summary.weeklyStats);
  const worst = findWorstWeek(summary.weeklyStats);

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
