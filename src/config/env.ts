import Constants from 'expo-constants';

/**
 * Environment configuration
 * Values are loaded from app.json extra field or environment variables
 */

const extra = Constants.expoConfig?.extra || {};

export const ENV = {
  // API Configuration
  BFF_URL: extra.bffUrl || 'http://localhost:9000',
  GAMING_API_URL: extra.gamingApiUrl || 'http://localhost:3002',

  // Firebase Configuration
  FIREBASE_API_KEY: extra.firebaseApiKey || '',
  FIREBASE_AUTH_DOMAIN: extra.firebaseAuthDomain || '',
  FIREBASE_PROJECT_ID: extra.firebaseProjectId || '',
  FIREBASE_STORAGE_BUCKET: extra.firebaseStorageBucket || '',
  FIREBASE_MESSAGING_SENDER_ID: extra.firebaseMessagingSenderId || '',
  FIREBASE_APP_ID: extra.firebaseAppId || '',

  // App Configuration
  APP_ENV: extra.appEnv || 'development',
  IS_DEV: extra.appEnv !== 'production',
} as const;

// Validate required environment variables
export const validateEnv = () => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_APP_ID',
  ] as const;

  const missing = required.filter(key => !ENV[key]);

  if (missing.length > 0) {
    console.warn(
      `[ENV] Missing required environment variables: ${missing.join(', ')}\n` +
      'Please configure them in app.json under "extra" field.'
    );
  }

  return missing.length === 0;
};

export default ENV;
