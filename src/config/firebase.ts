import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';

/**
 * Firebase configuration
 * Initialize Firebase app and auth services
 *
 * Note: Using Firebase Web SDK with Expo.
 * For React Native, we use getReactNativePersistence with AsyncStorage.
 */

const firebaseConfig: FirebaseOptions = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

// Import getReactNativePersistence dynamically to avoid TypeScript errors
// This is available at runtime but may not be in the type definitions
let getReactNativePersistence: any;
try {
  // Try to import from firebase/auth - this will work at runtime
  const authModule = require('firebase/auth');
  getReactNativePersistence = authModule.getReactNativePersistence;
} catch (e) {
  // Fallback if not available
  console.warn('[Firebase] getReactNativePersistence not available');
}

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;

try {
  firebaseApp = initializeApp(firebaseConfig);

  // Initialize Auth with React Native persistence using AsyncStorage
  try {
    if (getReactNativePersistence) {
      auth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      if (ENV.IS_DEV) {
        console.log('[Firebase] Initialized with React Native AsyncStorage persistence');
      }
    } else {
      // Use default auth if getReactNativePersistence not available
      auth = getAuth(firebaseApp);
      if (ENV.IS_DEV) {
        console.log('[Firebase] getReactNativePersistence not available, using default auth');
      }
    }
  } catch (persistenceError) {
    // Fallback to default auth if persistence fails (e.g., already initialized)
    auth = getAuth(firebaseApp);
    if (ENV.IS_DEV) {
      console.warn('[Firebase] Could not initialize with persistence, using default:', persistenceError);
    }
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  throw error;
}

export { firebaseApp, auth };
export default firebaseApp;
