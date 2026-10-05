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
  UPLOAD_TIMEOUT: 60000, // 60 seconds

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
    BY_WEEK: (userId: string, week: number, mode: 'live' | 'test' = 'live', season?: number) =>
      `/predictions/user/${userId}/week/${week}?mode=${mode}${season ? `&season=${season}` : ''}`,
    SUMMARY: (userId: string, mode: 'live' | 'test' = 'live') =>
      `/predictions/user/${userId}/summary?mode=${mode}`,
    DELETE: (userId: string, mode?: 'live' | 'test') =>
      `/predictions/user/${userId}${mode ? `?mode=${mode}` : ''}`,
  },

  // Leghe private
  LEAGUES: {
    LIST: '/leagues',
    CREATE: '/leagues',
    BY_ID: (leagueId: string) => `/leagues/${leagueId}`,
    STANDINGS: (leagueId: string, scope: 'season' | 'week' = 'season', week?: number) =>
      `/leagues/${leagueId}/standings?scope=${scope}${week ? `&week=${week}` : ''}`,
    MEMBERS: (leagueId: string) => `/leagues/${leagueId}/members`,
    RENAME: (leagueId: string) => `/leagues/${leagueId}`,
    ROTATE_CODE: (leagueId: string) => `/leagues/${leagueId}/invite-code`,
    CLOSE_INVITES: (leagueId: string) => `/leagues/${leagueId}/invite-code`,
    LEAVE: (leagueId: string) => `/leagues/${leagueId}/members/me`,
    REMOVE_MEMBER: (leagueId: string, userId: string) => `/leagues/${leagueId}/members/${userId}`,
    REINSTATE_MEMBER: (leagueId: string, userId: string) =>
      `/leagues/${leagueId}/members/${userId}/reinstate`,
    TRANSFER_OWNER: (leagueId: string) => `/leagues/${leagueId}/owner`,
    DELETE: (leagueId: string) => `/leagues/${leagueId}`,
  },

  // Inviti alle leghe (il codice non e' un id: ha rotte sue)
  INVITES: {
    PREVIEW: (code: string) => `/invites/${code}`,
    ACCEPT: (code: string) => `/invites/${code}/accept`,
  },

  // Match Cards
  MATCH_CARDS: {
    BY_WEEK: (week: number, season?: number) =>
      `/match-cards/week/${week}${season ? `?season=${season}` : ''}`,
  },
} as const;

export default API_CONFIG;
