import {
  WeeklyStats,
  UserSummary,
  ProfileKPI,
  WeekPerformance,
  LastWeekPerformance,
  ChartBar,
} from '../types/profile';
import { SWIPICK_URL } from '../config/links';

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
 * Giornate con almeno una partita conclusa, in ordine di calendario.
 * E' la base di tutto cio' che si puo' mostrare: una giornata senza risultati
 * non ha una percentuale da raccontare.
 */
function playedWeeks(weeklyStats: WeeklyStats[]): WeeklyStats[] {
  return weeklyStats
    .filter((w) => w.finishedPredictions > 0)
    .sort((a, b) => a.week - b.week);
}

/**
 * Ultima giornata conclusa, con il confronto sulla precedente: serve a dire
 * "70% ▲" invece del solo numero, che da solo non dice se si sta migliorando.
 */
export function findLastWeek(weeklyStats: WeeklyStats[]): LastWeekPerformance {
  const played = playedWeeks(weeklyStats);

  if (played.length === 0) {
    return { pct: formatItalianPercentage(0), week: null, trend: null };
  }

  const last = played[played.length - 1];
  const previous = played.length > 1 ? played[played.length - 2] : null;

  let trend: LastWeekPerformance['trend'] = null;
  if (previous) {
    if (last.accuracy > previous.accuracy) trend = 'up';
    else if (last.accuracy < previous.accuracy) trend = 'down';
    else trend = 'flat';
  }

  return {
    pct: formatItalianPercentage(last.accuracy),
    week: last.week,
    trend,
  };
}

/**
 * Barre del grafico: una per giornata conclusa.
 * Oltre `limit` si tengono le piu' recenti — a fine stagione trentotto barre
 * su uno schermo da 390 punti sarebbero linee illeggibili.
 */
export function buildChartBars(
  weeklyStats: WeeklyStats[],
  limit: number = 8
): ChartBar[] {
  return playedWeeks(weeklyStats)
    .slice(-limit)
    .map((w) => ({
      week: w.week,
      accuracy: w.accuracy,
      pct: `${Math.round(w.accuracy)}%`,
    }));
}

/** Numeri grezzi sulle partite concluse: la percentuale da sola non si verifica. */
function rawTotals(weeklyStats: WeeklyStats[]): {
  correct: number;
  finished: number;
} {
  return playedWeeks(weeklyStats).reduce(
    (acc, week) => {
      acc.correct += week.correctPredictions;
      acc.finished += week.finishedPredictions;
      return acc;
    },
    { correct: 0, finished: 0 }
  );
}

/**
 * Calculate all KPIs from user summary
 * Main function to generate display data for profile screen
 */
export function calculateProfileKPIs(summary: UserSummary | null): ProfileKPI {
  if (!summary || summary.weeklyStats.length === 0) {
    return {
      average: formatItalianPercentage(0),
      hasResults: false,
      correct: 0,
      finished: 0,
      weeksPlayed: 0,
      best: { pct: formatItalianPercentage(0), week: null },
      worst: { pct: formatItalianPercentage(0), week: null },
      last: { pct: formatItalianPercentage(0), week: null, trend: null },
      chart: [],
    };
  }

  const weeksPlayed = calculateWeeksPlayed(summary.weeklyStats);
  const average = calculateWeightedAverage(summary.weeklyStats);
  const best = findBestWeek(summary.weeklyStats);
  const worst = findWorstWeek(summary.weeklyStats);
  const last = findLastWeek(summary.weeklyStats);
  const chart = buildChartBars(summary.weeklyStats);
  const { correct, finished } = rawTotals(summary.weeklyStats);

  return {
    average: formatItalianPercentage(average),
    hasResults: finished > 0,
    correct,
    finished,
    weeksPlayed,
    best,
    worst,
    last,
    chart,
  };
}

/**
 * "2ª giornata" — l'ordinale che usa il resto dell'app.
 */
export function ordinalWeek(week: number | null): string {
  return week === null ? '' : `${week}ª giornata`;
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
 * Messaggio di condivisione del profilo.
 *
 * Due numeri con ruoli distinti — la costanza e il picco — e la chiusa che
 * raccoglie la sfida. Il link è la parte che prima mancava del tutto: senza,
 * chi riceve il messaggio non ha modo di arrivare al gioco.
 */
export function generateShareMessage(kpi: ProfileKPI): string {
  const giornate =
    kpi.weeksPlayed === 1 ? '1 giornata' : `${kpi.weeksPlayed} giornate`;

  const righe = [`${giornate} su Swipick, ${kpi.average} di media.`];

  // Senza risultati il record non esiste: tacerlo è meglio che scrivere 0%.
  if (kpi.hasResults && kpi.best.week !== null) {
    righe.push(`Il mio record è ${kpi.best.pct} in una giornata.`);
  }

  righe.push('Prova a battermi.');

  return `${righe.join('\n')}\n\n${SWIPICK_URL.replace('https://', '')}`;
}
