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
 * For React Native, we create a custom persistence layer using AsyncStorage.
 */

const firebaseConfig: FirebaseOptions = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
};

// Custom React Native persistence using AsyncStorage
const reactNativeLocalPersistence = {
  type: 'LOCAL' as const,
  _get: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  _set: async (name: string, value: Record<string, unknown>) => {
    try {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  },
  _remove: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
  _isAvailable: async () => true,
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let auth: Auth;

try {
  firebaseApp = initializeApp(firebaseConfig);

  // Initialize Auth with custom AsyncStorage persistence for React Native
  try {
    auth = initializeAuth(firebaseApp, {
      persistence: reactNativeLocalPersistence as any,
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
