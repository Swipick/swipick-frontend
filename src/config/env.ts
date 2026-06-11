import Constants from 'expo-constants';

/**
 * Environment configuration
 * Values are loaded from app.json extra field or environment variables
 */

const extra = Constants.expoConfig?.extra || {};

export const ENV = {
  // API Configuration
  BFF_URL: extra.bffUrl || 'http://localhost:9000',
  BFF_API_URL: extra.bffApiUrl || 'http://localhost:9000/api',
  GAMING_API_URL: extra.gamingApiUrl || 'http://localhost:9000',

  // Firebase Configuration
  FIREBASE_API_KEY: extra.firebaseApiKey || '',
  FIREBASE_AUTH_DOMAIN: extra.firebaseAuthDomain || '',
  FIREBASE_PROJECT_ID: extra.firebaseProjectId || '',
  FIREBASE_STORAGE_BUCKET: extra.firebaseStorageBucket || '',
  FIREBASE_MESSAGING_SENDER_ID: extra.firebaseMessagingSenderId || '',
  FIREBASE_APP_ID: extra.firebaseAppId || '',

  // Google Sign-In (OAuth client IDs — single source of truth: app.json extra)
  GOOGLE_WEB_CLIENT_ID: extra.googleWebClientId || '',
  GOOGLE_IOS_CLIENT_ID: extra.googleIosClientId || '',

  // App Configuration
  APP_ENV: extra.appEnv || 'development',
  IS_DEV: extra.appEnv !== 'production',
} as const;

// Validate required environment variables.
// Blocking: a build without these values cannot authenticate users — failing
// fast at startup beats a broken login screen at runtime.
export const validateEnv = () => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
    'GOOGLE_WEB_CLIENT_ID',
    'GOOGLE_IOS_CLIENT_ID',
    'BFF_API_URL',
  ] as const;

  const missing = required.filter(key => !ENV[key]);

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}. ` +
      'Configure them in app.json under "extra".'
    );
  }

  return true;
};

export default ENV;
