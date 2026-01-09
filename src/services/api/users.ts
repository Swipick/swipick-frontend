import { apiClient } from './client';

/**
 * User API Service
 * Handles user registration, profile management, and email verification
 */

export interface RegisterUserDto {
  email: string;
  name: string;
  nickname: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  nickname: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  authProvider: string;
  verificationLink?: string; // Dev mode only
}

export interface SyncGoogleUserResponse {
  id: string;
  needsProfileCompletion: boolean;
}

export const usersApi = {
  /**
   * Register a new user with email/password
   * Backend will create Firebase user + DB record + send verification email
   */
  async registerUser(data: RegisterUserDto): Promise<UserResponseDto> {
    try {
      console.log('[UsersAPI] Registering user:', { email: data.email, name: data.name });

      const response = await apiClient.post<UserResponseDto>('/users/register', data);

      console.log('[UsersAPI] User registered successfully:', response);
      return response;
    } catch (error: any) {
      console.error('[UsersAPI] Registration error:', error);
      console.error('[UsersAPI] Error response:', error.response?.data);
      console.error('[UsersAPI] Error status:', error.response?.status);

      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Registrazione non riuscita. Riprova più tardi.');
    }
  },

  /**
   * Resend verification email to user
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      console.log('[UsersAPI] Resending verification email to:', email);

      await apiClient.post('/users/resend-verification', { email });

      console.log('[UsersAPI] Verification email resent successfully');
    } catch (error: any) {
      console.error('[UsersAPI] Resend email error:', error);
      console.error('[UsersAPI] Error response:', error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Impossibile inviare l\'email. Riprova più tardi.');
    }
  },

  /**
   * Sync Google user with backend (for Google OAuth)
   * Backend will create user if new, or return existing user
   */
  async syncGoogleUser(firebaseIdToken: string): Promise<SyncGoogleUserResponse> {
    try {
      console.log('[UsersAPI] Syncing Google user');

      const response = await apiClient.post<SyncGoogleUserResponse>(
        '/users/sync-google',
        { firebaseIdToken }
      );

      console.log('[UsersAPI] Google user synced:', response);
      return response;
    } catch (error: any) {
      console.error('[UsersAPI] Google sync error:', error);
      console.error('[UsersAPI] Error response:', error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Accesso con Google non riuscito. Riprova più tardi.');
    }
  },
};

export default usersApi;
