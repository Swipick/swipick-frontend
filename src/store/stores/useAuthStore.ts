import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  AuthStore,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../../types/auth.types';
import { authService } from '../../services/auth/authService';
import { setUnauthorizedHandler } from '../../services/api/unauthorizedHandler';

/**
 * Zustand Auth Store
 * Manages authentication state and actions
 */
export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  firebaseUser: null,
  isGuest: false,
  loading: false,
  error: null,

  // Actions
  signIn: async (credentials: LoginCredentials) => {
    try {
      set({ loading: true, error: null });
      const firebaseUser = await authService.signIn(credentials);

      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      };

      set({ user, firebaseUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (credentials: RegisterCredentials) => {
    try {
      set({ loading: true, error: null });
      const firebaseUser = await authService.signUp(credentials);

      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      };

      set({ user, firebaseUser, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signOut();
      set({ user: null, firebaseUser: null, isGuest: false, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await authService.resetPassword(email);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signInWithApple: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signInWithApple();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setUser: (firebaseUser: User | null) => {
    if (firebaseUser) {
      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      };
      // Un utente reale annulla sempre la modalità ospite.
      set({ user, firebaseUser, isGuest: false });
    } else {
      set({ user: null, firebaseUser: null });
    }
  },

  setGuest: (isGuest: boolean) => set({ isGuest }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),
}));

// Sessioni zombie: su 401 ripetuti il client API forza il signout tramite
// questo handler (registrato qui per evitare l'import circolare client→store).
setUnauthorizedHandler(() => {
  const { user, signOut } = useAuthStore.getState();
  if (user) {
    console.warn(
      '[AuthStore] Sessione non più valida (401 ripetuti) — signout forzato',
    );
    void signOut();
  }
});

export default useAuthStore;
