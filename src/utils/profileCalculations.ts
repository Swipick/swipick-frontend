import { WeeklyStats, UserSummary, ProfileKPI, WeekPerformance } from '../types/profile';

/**
 * Profile Calculation Utilities
 * Functions for transforming API data and calculating KPIs
 */

// ============================================================================
// DATA NORMALIZATION
// ============================================================================

/** Forma grezza (snake_case) della risposta del backend per il summary. */
interface RawPrediction {
  is_correct?: boolean | null;
  result?: string | null;
}

interface RawWeeklyStat {
  week: number;
  predictions?: RawPrediction[];
  total_predictions?: number;
  correct_predictions?: number;
  success_rate?: number;
  points?: number;
}

interface RawSummary {
  user_id: string;
  total_predictions: number;
  correct_predictions: number;
  overall_success_rate: number;
  weekly_stats?: RawWeeklyStat[];
}

/**
 * Normalize snake_case API response to camelCase
 * Handles both single-wrapped and double-wrapped responses
 */
export function normalizeSummaryResponse(response: unknown): UserSummary {
  // Handle double-wrapped response: { data: { data: { ... } } }
  const envelope = response as { data?: { data?: RawSummary } & RawSummary };
  const rawData: RawSummary =
    envelope.data?.data || envelope.data || (response as RawSummary);

  const weeklyStats: WeeklyStats[] = (rawData.weekly_stats || []).map((week: RawWeeklyStat) => {
    // Check if backend provides detailed predictions array
    const predictions = week.predictions ?? [];
    const hasPredictionsArray = Array.isArray(week.predictions) && predictions.length > 0;

    let actualTotalPredictions: number;
    let actualCorrectPredictions: number;
    let actualFinishedPredictions: number;
    let actualAccuracy: number;

    if (hasPredictionsArray) {
      // Calculate from predictions array (when available)
      actualTotalPredictions = predictions.length;
      actualCorrectPredictions = predictions.filter((p) => p.is_correct === true).length;

      // Recalculate accuracy based on FINISHED matches only
      const finishedPredictions = predictions.filter((p) => p.result !== null);
      const finishedCorrect = finishedPredictions.filter((p) => p.is_correct === true).length;
      actualFinishedPredictions = finishedPredictions.length;
      actualAccuracy = finishedPredictions.length > 0
        ? (finishedCorrect / finishedPredictions.length) * 100
        : 0;
    } else {
      // Use backend-provided values (summary endpoint)
      actualTotalPredictions = week.total_predictions || 0;
      actualCorrectPredictions = week.correct_predictions || 0;
      // For summary endpoint, assume all predictions are finished if accuracy exists
      actualFinishedPredictions =
        (week.success_rate ?? 0) > 0 || (week.correct_predictions ?? 0) > 0
          ? actualTotalPredictions
          : 0;
      // Use success_rate from backend (already calculated correctly)
      actualAccuracy = week.success_rate || 0;
    }

    return {
      week: week.week,
      totalPredictions: actualTotalPredictions,
      correctPredictions: actualCorrectPredictions,
      finishedPredictions: actualFinishedPredictions,
      accuracy: actualAccuracy,
      points: week.points ?? 0,
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
  // Only finished matches count: predictions on matches still to be played
  // must not dilute the average (start of season / giornata in corso).
  const played = weeklyStats.filter((w) => w.finishedPredictions > 0);

  if (played.length === 0) {
    return 0;
  }

  const totals = played.reduce(
    (acc, week) => {
      acc.finished += week.finishedPredictions;
      acc.correct += week.correctPredictions;
      return acc;
    },
    { finished: 0, correct: 0 }
  );

  return totals.finished > 0 ? (totals.correct / totals.finished) * 100 : 0;
}

/**
 * Find best week (highest accuracy)
 * Only considers weeks with finished matches
 * Tie-breaking rules:
 * 1. Highest accuracy percentage
 * 2. If tied: Most correct predictions
 * 3. If still tied: Earliest week number
 */
export function findBestWeek(weeklyStats: WeeklyStats[]): WeekPerformance {
  // Only consider weeks where matches have actually finished
  const playedAndFinished = weeklyStats.filter((w) => w.finishedPredictions > 0);

  if (playedAndFinished.length === 0) {
    return { pct: formatItalianPercentage(0), week: null };
  }

  const best = [...playedAndFinished].sort((a, b) => {
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
 * Only considers weeks with finished matches
 * Tie-breaking rules:
 * 1. Lowest accuracy percentage
 * 2. If tied: Fewest correct predictions
 * 3. If still tied: Earliest week number
 */
export function findWorstWeek(weeklyStats: WeeklyStats[]): WeekPerformance {
  // Only consider weeks where matches have actually finished
  const playedAndFinished = weeklyStats.filter((w) => w.finishedPredictions > 0);

  if (playedAndFinished.length === 0) {
    return { pct: formatItalianPercentage(0), week: null };
  }

  const worst = [...playedAndFinished].sort((a, b) => {
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
      best: { pct: formatItalianPercentage(0), week: null },
      worst: { pct: formatItalianPercentage(0), week: null },
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
