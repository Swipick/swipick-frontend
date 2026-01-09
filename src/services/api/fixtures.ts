import { apiClient } from "./client";
import { FixturesResponse, MatchCard, FixtureWithResult } from "../../types/game.types";
import { ENDPOINTS } from "../../config/api";

/**
 * Fixtures API Service
 * Handles fetching match fixtures from the backend
 */

export const fixturesApi = {
  /**
   * Get match cards for a specific week
   */
  getFixturesByWeek: async (week: number): Promise<MatchCard[]> => {
    try {
      // API returns array directly, not wrapped in object
      const response = await apiClient.get<MatchCard[]>(
        ENDPOINTS.MATCH_CARDS.BY_WEEK(week)
      );
      console.log(`[FixturesAPI] Loaded ${response.length} match cards for week ${week}`);
      return response;
    } catch (error: any) {
      console.error("[FixturesAPI] Error fetching fixtures:", error);
      throw new Error("Failed to load fixtures. Please try again.");
    }
  },

  /**
   * Get current live week by fetching next fixtures
   */
  getLiveWeek: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ success: boolean; detectedWeek: number }>(
        '/fixtures/next',
        { params: { limit: 10 } }
      );
      const week = response.detectedWeek || 1;
      console.log(`[FixturesAPI] Detected live week: ${week}`);
      return week;
    } catch (error: any) {
      console.error("[FixturesAPI] Error fetching live week:", error);
      // Fallback to week 1 if API fails
      return 1;
    }
  },

  /**
   * Get fixture by ID
   */
  getFixtureById: async (fixtureId: string): Promise<MatchCard | null> => {
    try {
      const response = await apiClient.get<{ fixture: MatchCard }>(
        ENDPOINTS.FIXTURES.BY_ID(fixtureId)
      );
      return response.fixture;
    } catch (error: any) {
      console.error("[FixturesAPI] Error fetching fixture:", error);
      return null;
    }
  },

  /**
   * Get fixtures with results for a specific week
   * This endpoint includes match scores and status
   */
  getFixturesWithResults: async (week: number): Promise<FixtureWithResult[]> => {
    try {
      const response = await apiClient.get<FixtureWithResult[]>(
        ENDPOINTS.FIXTURES.BY_WEEK(week)
      );
      console.log(`[FixturesAPI] Loaded ${response.length} fixtures with results for week ${week}`);
      return response;
    } catch (error: any) {
      console.error("[FixturesAPI] Error fetching fixtures with results:", error);
      throw new Error("Failed to load fixtures with results. Please try again.");
    }
  },
};

export default fixturesApi;
