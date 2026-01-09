import { create } from 'zustand';
import { User } from 'firebase/auth';
import {
  AuthStore,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../../types/auth.types';
import { authService } from '../../services/auth/authService';

/**
 * Zustand Auth Store
 * Manages authentication state and actions
 */
export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  firebaseUser: null,
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
      set({ user: null, firebaseUser: null, loading: false });
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

  setUser: (firebaseUser: User | null) => {
    if (firebaseUser) {
      const user: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
      };
      set({ user, firebaseUser });
    } else {
      set({ user: null, firebaseUser: null });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
