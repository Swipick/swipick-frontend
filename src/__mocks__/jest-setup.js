// Preemptively define __ExpoImportMetaRegistry to prevent Expo's winter runtime
// lazy getter from trying to load runtime.native.ts (which uses ESM imports
// incompatible with Jest's CommonJS environment)
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
  value: new Map(),
  writable: true,
  configurable: true,
  enumerable: false,
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        BFF_URL: 'http://localhost:9000',
        BFF_API_URL: 'http://localhost:9000/api',
        GAMING_API_URL: 'http://localhost:3000',
        FIREBASE_API_KEY: 'test-api-key',
        FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
        FIREBASE_PROJECT_ID: 'test-project',
        FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
        FIREBASE_MESSAGING_SENDER_ID: '123456',
        FIREBASE_APP_ID: '1:123456:web:abc',
        APP_ENV: 'test',
      },
    },
  },
}));
