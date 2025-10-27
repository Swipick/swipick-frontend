/**
 * Settings Types & Interfaces
 * Type definitions for user settings and preferences
 */

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  results: boolean;                // Weekly results notification
  matches: boolean;                // Match notifications at 90th minute (disabled in UI)
  goals: boolean;                  // Goal notifications (disabled in UI)
}

export interface PreferencesUpdate {
  results?: boolean;
  matches?: boolean;
  goals?: boolean;
}

// ============================================================================
// SETTINGS SCREEN STATE
// ============================================================================

export interface SettingsScreenState {
  // User info
  userId: string | null;
  email: string;
  nickname: string | null;

  // Preferences
  notifResults: boolean;
  notifMatches: boolean;
  notifGoals: boolean;

  // UI state
  loading: boolean;
  error: string | null;
  toast: string | null;
  prossimamenteToast: string | null;

  // File upload
  uploading: boolean;

  // Account deletion
  deleting: boolean;
  showDeleteModal: boolean;
}

// ============================================================================
// TOAST TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  type: ToastType;
  message: string;
  duration?: number;
}
