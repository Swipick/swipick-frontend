import { apiClient } from './client';
import {
  Prediction,
  PredictionResponse,
  CreatePredictionDto,
  WeeklyStats,
} from '../../types/game.types';
import { ENDPOINTS } from '../../config/api';

/**
 * Predictions API Service
 * Handles creating, fetching, and deleting predictions
 */

export const predictionsApi = {
  /**
   * Create a new prediction
   */
  createPrediction: async (
    data: CreatePredictionDto
  ): Promise<Prediction> => {
    try {
      const response = await apiClient.post<PredictionResponse>(
        ENDPOINTS.PREDICTIONS.CREATE,
        data
      );
      return response.prediction;
    } catch (error: any) {
      console.error('[PredictionsAPI] Error creating prediction:', error);
      throw new Error('Failed to save prediction. Please try again.');
    }
  },

  /**
   * Get predictions for a specific week
   */
  getWeeklyPredictions: async (
    userId: string,
    week: number,
    mode: 'live' | 'test' = 'live'
  ): Promise<WeeklyStats> => {
    try {
      const response = await apiClient.get<WeeklyStats>(
        ENDPOINTS.PREDICTIONS.BY_WEEK(userId, week, mode)
      );
      return response;
    } catch (error: any) {
      console.error('[PredictionsAPI] Error fetching predictions:', error);
      throw new Error('Failed to load predictions. Please try again.');
    }
  },

  /**
   * Get user's prediction summary
   */
  getUserSummary: async (
    userId: string,
    mode: 'live' | 'test' = 'live'
  ): Promise<any> => {
    try {
      const response = await apiClient.get(
        ENDPOINTS.PREDICTIONS.SUMMARY(userId, mode)
      );
      return response;
    } catch (error: any) {
      console.error('[PredictionsAPI] Error fetching summary:', error);
      throw new Error('Failed to load summary. Please try again.');
    }
  },

  /**
   * Delete all predictions for a user (reset game)
   */
  deleteUserPredictions: async (
    userId: string,
    mode?: 'live' | 'test'
  ): Promise<void> => {
    try {
      await apiClient.delete(ENDPOINTS.PREDICTIONS.DELETE(userId, mode));
      console.log('[PredictionsAPI] Predictions deleted successfully');
    } catch (error: any) {
      console.error('[PredictionsAPI] Error deleting predictions:', error);
      throw new Error('Failed to reset game. Please try again.');
    }
  },
};

export default predictionsApi;
