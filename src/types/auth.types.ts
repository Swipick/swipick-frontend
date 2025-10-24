import { User } from 'firebase/auth';

/**
 * Authentication Types
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthState {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// Firebase Auth Error Codes
export enum FirebaseAuthError {
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_REQUEST_FAILED = 'auth/network-request-failed',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
}

// User-friendly error messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [FirebaseAuthError.EMAIL_ALREADY_IN_USE]:
    'This email is already registered. Please login instead.',
  [FirebaseAuthError.INVALID_EMAIL]:
    'Invalid email address. Please check and try again.',
  [FirebaseAuthError.USER_DISABLED]:
    'This account has been disabled. Please contact support.',
  [FirebaseAuthError.USER_NOT_FOUND]:
    'No account found with this email. Please register first.',
  [FirebaseAuthError.WRONG_PASSWORD]:
    'Incorrect password. Please try again.',
  [FirebaseAuthError.WEAK_PASSWORD]:
    'Password is too weak. Please use at least 6 characters.',
  [FirebaseAuthError.NETWORK_REQUEST_FAILED]:
    'Network error. Please check your internet connection.',
  [FirebaseAuthError.TOO_MANY_REQUESTS]:
    'Too many attempts. Please try again later.',
  default: 'An error occurred. Please try again.',
};
