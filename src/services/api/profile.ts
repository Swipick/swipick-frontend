import { apiClient } from './client';

/**
 * Profile API Service
 * Handles user profile, statistics, preferences, and avatar management
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;                      // Backend user UUID
    firebaseUid: string;
    email: string;
    nome: string | null;             // Full name
    sopranome: string | null;        // Nickname/username
    googleProfileUrl: string | null;
    needsProfileCompletion: boolean;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

export interface UserSummaryResponse {
  success: boolean;
  data: {
    user_id: string;
    total_predictions: number;
    correct_predictions: number;
    overall_success_rate: number;
    weekly_stats: Array<{
      week: number;
      total_predictions: number;
      correct_predictions: number;
      success_rate: number;
      points: number;
    }>;
  };
}

export interface UserAvatarResponse {
  success: boolean;
  data: {
    mimeType: string;
    base64: string;
  };
}

export interface UserPreferencesResponse {
  success: boolean;
  data: {
    results: boolean;
    matches: boolean;
    goals: boolean;
  };
}

export interface PreferencesUpdate {
  results?: boolean;
  matches?: boolean;
  goals?: boolean;
}

// ============================================================================
// API METHODS
// ============================================================================

export const profileApi = {
  /**
   * Get user profile by Firebase UID
   * Resolves backend user ID and retrieves basic user info
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserProfileResponse> {
    try {
      console.log('[ProfileAPI] Getting user by Firebase UID:', firebaseUid);

      const response = await apiClient.get<UserProfileResponse>(
        `/users/profile/firebase/${firebaseUid}`
      );

      console.log('[ProfileAPI] User profile retrieved:', response);
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Get user error:', error);
      console.error('[ProfileAPI] Error response:', error.response?.data);

      if (error.response?.status === 404) {
        throw new Error('Utente non trovato');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Impossibile caricare il profilo utente');
    }
  },

  /**
   * Get user prediction summary with weekly statistics
   * Uses Firebase UID (not backend user ID)
   */
  async getUserSummary(
    firebaseUid: string,
    mode: 'live' | 'test' = 'live'
  ): Promise<UserSummaryResponse> {
    try {
      console.log('[ProfileAPI] Getting user summary:', { firebaseUid, mode });

      const response = await apiClient.get<UserSummaryResponse>(
        `/predictions/user/${firebaseUid}/summary?mode=${mode}`
      );

      console.log('[ProfileAPI] User summary retrieved:', response);
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Get summary error:', error);
      console.error('[ProfileAPI] Error response:', error.response?.data);

      // 404 is expected for new users with no predictions
      if (error.response?.status === 404) {
        console.log('[ProfileAPI] No predictions found (new user)');
        // Return empty summary for new users
        return {
          success: true,
          data: {
            user_id: firebaseUid,
            total_predictions: 0,
            correct_predictions: 0,
            overall_success_rate: 0,
            weekly_stats: [],
          },
        };
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Impossibile caricare le statistiche');
    }
  },

  /**
   * Get user avatar (base64 encoded image)
   * Uses backend user ID (not Firebase UID)
   */
  async getUserAvatar(userId: string): Promise<UserAvatarResponse | null> {
    try {
      console.log('[ProfileAPI] Getting user avatar:', userId);

      const response = await apiClient.get<UserAvatarResponse>(
        `/users/${userId}/avatar`
      );

      console.log('[ProfileAPI] Avatar retrieved');
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Get avatar error:', error);

      // 404 is expected if user hasn't uploaded avatar
      if (error.response?.status === 404) {
        console.log('[ProfileAPI] No avatar found (expected)');
        return null;
      }

      // Don't throw error for avatar - just return null and use fallback
      console.warn('[ProfileAPI] Avatar fetch failed, using fallback');
      return null;
    }
  },

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesResponse> {
    try {
      console.log('[ProfileAPI] Getting user preferences:', userId);

      const response = await apiClient.get<UserPreferencesResponse>(
        `/users/${userId}/preferences`
      );

      console.log('[ProfileAPI] Preferences retrieved:', response);
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Get preferences error:', error);

      // Return defaults if no preferences set
      if (error.response?.status === 404) {
        console.log('[ProfileAPI] No preferences found, using defaults');
        return {
          success: true,
          data: {
            results: true,
            matches: true,
            goals: true,
          },
        };
      }

      throw new Error('Impossibile caricare le preferenze');
    }
  },

  /**
   * Update user notification preferences (partial update)
   */
  async updateUserPreferences(
    userId: string,
    preferences: PreferencesUpdate
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[ProfileAPI] Updating preferences:', { userId, preferences });

      const response = await apiClient.patch<{ success: boolean; message: string }>(
        `/users/${userId}/preferences`,
        preferences
      );

      console.log('[ProfileAPI] Preferences updated:', response);
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Update preferences error:', error);
      console.error('[ProfileAPI] Error response:', error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Impossibile aggiornare le preferenze');
    }
  },

  /**
   * Upload user avatar (multipart/form-data)
   */
  async uploadUserAvatar(
    userId: string,
    formData: FormData
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[ProfileAPI] Uploading avatar for user:', userId);

      const response = await apiClient.post<{ success: boolean; message: string }>(
        `/users/${userId}/avatar/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('[ProfileAPI] Avatar uploaded successfully');
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Upload avatar error:', error);
      console.error('[ProfileAPI] Error response:', error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Caricamento avatar fallito');
    }
  },

  /**
   * Delete user account (requires Firebase auth token)
   * This will cascade delete all user data: predictions, scores, preferences, avatar
   */
  async deleteAccount(
    userId: string,
    firebaseIdToken: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('[ProfileAPI] Deleting account:', userId);

      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${firebaseIdToken}`,
          },
        }
      );

      console.log('[ProfileAPI] Account deleted successfully');
      return response;
    } catch (error: any) {
      console.error('[ProfileAPI] Delete account error:', error);
      console.error('[ProfileAPI] Error response:', error.response?.data);

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('Autenticazione richiesta per eliminare l\'account');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Eliminazione account fallita');
    }
  },
};

export default profileApi;
