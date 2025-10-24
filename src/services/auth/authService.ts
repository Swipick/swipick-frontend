import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LoginCredentials,
  RegisterCredentials,
  AUTH_ERROR_MESSAGES,
} from '../../types/auth.types';

const EMAIL_KEY = '@swipick:emailForSignIn';

/**
 * Authentication Service
 * Wrapper around Firebase Auth with error handling and local storage
 */
class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      await this.saveEmailForSignIn(credentials.email);

      console.log('[AuthService] Sign in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[AuthService] Sign in error:', error.code);
      throw new Error(
        AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default
      );
    }
  }

  /**
   * Register new user with email and password
   */
  async signUp(credentials: RegisterCredentials): Promise<User> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update display name if provided
      if (credentials.displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: credentials.displayName,
        });
      }

      // Send verification email
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        console.log('[AuthService] Verification email sent');
      }

      await this.saveEmailForSignIn(credentials.email);

      console.log('[AuthService] Sign up successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('[AuthService] Sign up error:', error.code);
      throw new Error(
        AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default
      );
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem(EMAIL_KEY);
      console.log('[AuthService] Sign out successful');
    } catch (error: any) {
      console.error('[AuthService] Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('[AuthService] Password reset email sent to:', email);
    } catch (error: any) {
      console.error('[AuthService] Password reset error:', error.code);
      throw new Error(
        AUTH_ERROR_MESSAGES[error.code] || AUTH_ERROR_MESSAGES.default
      );
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Get ID token for API requests
   */
  async getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('[AuthService] Failed to get ID token:', error);
      return null;
    }
  }

  /**
   * Save email for sign-in
   */
  private async saveEmailForSignIn(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EMAIL_KEY, email);
    } catch (error) {
      console.error('[AuthService] Failed to save email:', error);
    }
  }

  /**
   * Get saved email
   */
  async getSavedEmailForSignIn(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EMAIL_KEY);
    } catch (error) {
      console.error('[AuthService] Failed to get saved email:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
