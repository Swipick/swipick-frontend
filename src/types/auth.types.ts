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

// User-friendly error messages (Italian)
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [FirebaseAuthError.EMAIL_ALREADY_IN_USE]:
    'Questa email è già registrata. Effettua il login.',
  [FirebaseAuthError.INVALID_EMAIL]:
    'Formato email non valido.',
  [FirebaseAuthError.USER_DISABLED]:
    'Questo account è stato disabilitato.',
  [FirebaseAuthError.USER_NOT_FOUND]:
    'Utente non trovato. Verifica l\'indirizzo email.',
  [FirebaseAuthError.WRONG_PASSWORD]:
    'Password errata. Riprova.',
  [FirebaseAuthError.WEAK_PASSWORD]:
    'Password troppo debole. Usa almeno 6 caratteri.',
  [FirebaseAuthError.NETWORK_REQUEST_FAILED]:
    'Errore di rete. Controlla la connessione.',
  [FirebaseAuthError.TOO_MANY_REQUESTS]:
    'Troppi tentativi falliti. Riprova più tardi.',
  'auth/invalid-credential': 'Credenziali non valide. Verifica email e password.',
  default: 'Errore durante l\'accesso. Riprova.',
};
