import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './env';

/**
 * Firebase configuration
 * Initialize Firebase app and auth services
 *
 * Note: Using Firebase Web SDK with AsyncStorage persistence for Expo.
 */

const firebaseConfig: FirebaseOptions = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;

try {
  firebaseApp = initializeApp(firebaseConfig);

  // Try to initialize Auth with AsyncStorage persistence
  // If getReactNativePersistence is not available, fall back to default
  try {
    auth = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    if (ENV.IS_DEV) {
      console.log('[Firebase] Initialized with AsyncStorage persistence');
    }
  } catch (persistenceError) {
    // Fallback to default auth if persistence fails
    auth = getAuth(firebaseApp);
    if (ENV.IS_DEV) {
      console.log('[Firebase] Initialized with default persistence');
    }
  }
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  throw error;
}

export { firebaseApp, auth };
export default firebaseApp;
