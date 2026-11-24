import i18n from '../i18n';
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
  /** Modalità ospite: l'utente esplora senza account (App Store 5.1.1). */
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  /**
   * Id backend dell'utente che ha l'accesso fatto ma non ancora il nickname.
   * Finché è valorizzato, l'app mostra il passo 2 al posto dell'area di gioco:
   * con Google e Apple l'accesso riesce prima che il profilo sia completo.
   */
  pendingNicknameUserId: string | null;
}

export interface AuthActions {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  setUser: (user: User | null) => void;
  setPendingNicknameUserId: (userId: string | null) => void;
  setGuest: (isGuest: boolean) => void;
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
/** Il codice d'errore (di Firebase o nostro) → la chiave del testo in `errori.auth`. */
const CHIAVI_ERRORE_AUTH: Record<string, string> = {
  [FirebaseAuthError.EMAIL_ALREADY_IN_USE]: 'emailGiaUsata',
  [FirebaseAuthError.INVALID_EMAIL]: 'emailNonValida',
  [FirebaseAuthError.USER_DISABLED]: 'accountDisabilitato',
  [FirebaseAuthError.USER_NOT_FOUND]: 'utenteNonTrovato',
  [FirebaseAuthError.WRONG_PASSWORD]: 'passwordErrata',
  [FirebaseAuthError.WEAK_PASSWORD]: 'passwordDebole',
  [FirebaseAuthError.NETWORK_REQUEST_FAILED]: 'rete',
  [FirebaseAuthError.TOO_MANY_REQUESTS]: 'troppiTentativi',
  'auth/invalid-credential': 'credenzialiNonValide',
  'apple-sign-in-cancelled': 'appleAnnullato',
  'apple-sign-in-unavailable': 'appleNonDisponibile',
  ERR_REQUEST_CANCELED: 'appleAnnullato',
};

/** Il codice ha un messaggio suo? Serve a chi deve distinguere un errore noto da uno generico. */
export const isKnownAuthError = (code?: string): boolean => !!code && code in CHIAVI_ERRORE_AUTH;

/**
 * Il messaggio per l'utente di un errore di accesso, nella lingua dell'app.
 * Accetta più candidati (es. `error.code` ed `error.message`): vale il primo
 * riconosciuto, altrimenti il messaggio generico.
 */
export function authErrorMessage(...codici: (string | undefined)[]): string {
  const chiave = codici.map((c) => c && CHIAVI_ERRORE_AUTH[c]).find(Boolean) ?? 'generico';
  return i18n.t(`errori.auth.${chiave}`);
}
