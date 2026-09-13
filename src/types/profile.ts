/**
 * Profile Types & Interfaces
 * Type definitions for user profile, statistics, and KPIs
 */

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile {
  id: string;                      // Backend user UUID
  firebaseUid: string;
  email: string;
  nome: string | null;             // Full name
  sopranome: string | null;        // Nickname/username
  googleProfileUrl: string | null;
  needsProfileCompletion: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface WeeklyStats {
  week: number;                    // Week number (1-38)
  totalPredictions: number;        // Predictions made this week (0-10)
  correctPredictions: number;      // Correct predictions this week
  finishedPredictions: number;     // Predictions with finished matches
  accuracy: number;                // Percentage (0-100)
  points: number;                  // Points earned this week
}

export interface UserSummary {
  userId: string;                  // Firebase UID
  totalPredictions: number;        // Total across all weeks
  correctPredictions: number;      // Total correct across all weeks
  overallAccuracy: number;         // Overall percentage (0-100)
  weeklyStats: WeeklyStats[];      // Array of weekly performance
}

// ============================================================================
// KPI DISPLAY
// ============================================================================

export interface WeekPerformance {
  pct: string;                     // Formatted percentage (e.g., "80,0%")
  week: number | null;             // Week number; null before the first finished results
}

/** Andamento di una giornata rispetto alla precedente conclusa. */
export type WeekTrend = 'up' | 'down' | 'flat' | null;

export interface LastWeekPerformance extends WeekPerformance {
  trend: WeekTrend;
}

export interface ChartBar {
  week: number;                    // Numero di giornata reale (non la posizione)
  accuracy: number;                // 0-100
  pct: string;                     // Percentuale formattata, senza decimali
}

export interface ProfileKPI {
  average: string;                 // Formatted average (e.g., "65,5%")
  /**
   * Almeno una partita conclusa. Distingue lo zero dal nulla: senza risultati
   * la schermata mostra un trattino, perche' 0% e' un esito e il vuoto no.
   */
  hasResults: boolean;
  correct: number;                 // Pronostici indovinati sulle partite concluse
  finished: number;                // Pronostici su partite concluse
  weeksPlayed: number;            // Number of weeks with predictions
  best: WeekPerformance;          // Best week performance
  worst: WeekPerformance;         // Worst week performance
  last: LastWeekPerformance;      // Ultima giornata conclusa, con l'andamento
  chart: ChartBar[];              // Una barra per giornata conclusa, in ordine
}

// ============================================================================
// PREFERENCES
// ============================================================================

export interface UserPreferences {
  results: boolean;                // Weekly results notification
  matches: boolean;                // Match notifications at 90th minute
  goals: boolean;                  // Goal notifications
}

export interface PreferencesUpdate {
  results?: boolean;
  matches?: boolean;
  goals?: boolean;
}

// ============================================================================
// AVATAR
// ============================================================================

export interface UserAvatar {
  mimeType: string;                // e.g., "image/jpeg"
  base64: string;                  // Base64 encoded image data
}

// ============================================================================
// PROFILE SCREEN STATE
// ============================================================================

export interface ProfileScreenState {
  // User info
  userId: string | null;
  displayName: string;
  nickname: string | null;
  email: string;
  avatarUrl: string | null;

  // Statistics
  summary: UserSummary | null;

  // UI state
  loading: boolean;
  error: string | null;
}
