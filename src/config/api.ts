import { ENV } from './env';

/**
 * API endpoint configuration
 */

export const API_CONFIG = {
  // Base URLs
  BFF_BASE_URL: ENV.BFF_URL,
  GAMING_BASE_URL: ENV.GAMING_API_URL,

  // Timeouts
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 60000,  // 60 seconds

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    STATS: '/user/stats',
    UPDATE: '/user/update',
    SYNC_APPLE: '/users/sync-apple',
    BY_FIREBASE_UID: (firebaseUid: string) => `/users/profile/firebase/${firebaseUid}`,
    AVATAR: (userId: string) => `/users/${userId}/avatar`,
    AVATAR_UPLOAD: (userId: string) => `/users/${userId}/avatar/upload`,
    PREFERENCES: (userId: string) => `/users/${userId}/preferences`,
    DELETE: (userId: string) => `/users/${userId}`,
  },

  // Fixtures
  FIXTURES: {
    BY_WEEK: (week: number, season?: number) =>
      `/fixtures/week/${week}${season ? `?season=${season}` : ''}`,
    BY_ID: (id: string) => `/fixtures/${id}`,
    LIVE_WEEK: '/fixtures/live-week',
    LAST_PLAYED: '/fixtures/last-played',
  },

  // Predictions
  PREDICTIONS: {
    CREATE: '/predictions',
    BY_WEEK: (
      userId: string,
      week: number,
      mode: 'live' | 'test' = 'live',
      season?: number,
    ) =>
      `/predictions/user/${userId}/week/${week}?mode=${mode}${
        season ? `&season=${season}` : ''
      }`,
    SUMMARY: (userId: string, mode: 'live' | 'test' = 'live') =>
      `/predictions/user/${userId}/summary?mode=${mode}`,
    DELETE: (userId: string, mode?: 'live' | 'test') =>
      `/predictions/user/${userId}${mode ? `?mode=${mode}` : ''}`,
  },

  // Match Cards
  MATCH_CARDS: {
    BY_WEEK: (week: number, season?: number) =>
      `/match-cards/week/${week}${season ? `?season=${season}` : ''}`,
  },
} as const;

export default API_CONFIG;
