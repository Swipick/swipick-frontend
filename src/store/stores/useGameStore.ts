import { create } from 'zustand';
import {
  MatchCard,
  PredictionChoice,
  GameState,
  CreatePredictionDto,
} from '../../types/game.types';
import { fixturesApi } from '../../services/api/fixtures';
import { predictionsApi } from '../../services/api/predictions';

/**
 * Zustand Game Store
 * Manages game state for Gioca screen
 */

interface GameActions {
  // Loading & initialization
  loadWeek: (week: number, mode: 'live' | 'test', userId: string) => Promise<void>;
  loadLiveWeek: (userId: string) => Promise<void>;

  // Predictions
  makePrediction: (choice: PredictionChoice, userId: string) => Promise<void>;
  skipCurrent: () => void;

  // Navigation
  nextCard: () => void;
  previousCard: () => void;
  goToCard: (index: number) => void;

  // Game control
  resetGame: (userId: string) => Promise<void>;
  toggleSummary: () => void;

  // State setters
  setMode: (mode: 'live' | 'test') => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentWeek: 1,
  mode: 'live',
  fixtures: [],
  predictions: new Map(),
  skippedFixtures: [],
  currentIndex: 0,
  loading: false,
  error: null,
  isComplete: false,
  showSummary: false,

  // Load fixtures for a specific week
  loadWeek: async (week: number, mode: 'live' | 'test', userId: string) => {
    set({ loading: true, error: null });

    try {
      // Load fixtures
      const fixtures = await fixturesApi.getFixturesByWeek(week);

      if (!fixtures || fixtures.length === 0) {
        set({
          loading: false,
          error: 'No fixtures available for this week.',
          fixtures: [],
        });
        return;
      }

      // Load existing predictions
      const weeklyStats = await predictionsApi.getWeeklyPredictions(userId, week, mode);
      const predictionsMap = new Map<string, PredictionChoice>();

      console.log(`[GameStore] Loaded ${weeklyStats.predictions.length} predictions from API for week ${week}`);
      console.log(`[GameStore] Raw first prediction:`, JSON.stringify(weeklyStats.predictions[0]));

      weeklyStats.predictions.forEach((pred: any) => {
        // Backend returns fixture_id (snake_case), but we need fixtureId (camelCase)
        const fixtureId = pred.fixtureId || pred.fixture_id;
        console.log(`[GameStore] Prediction: ${fixtureId} -> ${pred.choice}`);
        if (fixtureId) {
          predictionsMap.set(fixtureId, pred.choice);
        }
      });

      // Check if game is already complete
      const now = new Date();
      const actualPredictions = Array.from(predictionsMap.values()).filter(
        (p) => p !== 'SKIP'
      ).length;

      const missedGames = fixtures.filter(
        (fixture) => new Date(fixture.kickoff.iso) <= now && !predictionsMap.has(fixture.fixtureId)
      ).length;

      const isGameComplete = actualPredictions + missedGames >= fixtures.length;
      console.log(`[GameStore] Completion check:`, {
        totalFixtures: fixtures.length,
        predictions: actualPredictions,
        missed: missedGames,
        complete: isGameComplete,
        predictionsMapSize: predictionsMap.size,
      });

      // Find the first fixture that doesn't have a prediction yet
      let startingIndex = 0;
      if (!isGameComplete) {
        startingIndex = fixtures.findIndex(
          (fixture) => !predictionsMap.has(fixture.fixtureId)
        );
        // If all fixtures have predictions but game isn't complete (e.g., all skipped), start at 0
        if (startingIndex === -1) {
          startingIndex = 0;
        }
        console.log(`[GameStore] Starting at index ${startingIndex} (first unpredicted card)`);
      }

      set({
        currentWeek: week,
        mode,
        fixtures,
        predictions: predictionsMap,
        currentIndex: startingIndex,
        skippedFixtures: [],
        loading: false,
        isComplete: isGameComplete,
        showSummary: isGameComplete,
      });
    } catch (error: any) {
      console.error('[GameStore] Error loading week:', error);
      set({ loading: false, error: error.message });
    }
  },

  // Load current live week
  loadLiveWeek: async (userId: string) => {
    try {
      const liveWeek = await fixturesApi.getLiveWeek();
      await get().loadWeek(liveWeek, 'live', userId);
    } catch (error: any) {
      console.error('[GameStore] Error loading live week:', error);
      set({ error: error.message });
    }
  },

  // Make a prediction
  makePrediction: async (choice: PredictionChoice, userId: string) => {
    const { fixtures, currentIndex, predictions, currentWeek, mode } = get();
    const currentFixture = fixtures[currentIndex];

    if (!currentFixture) {
      console.error('[GameStore] No current fixture');
      return;
    }

    // Skip action
    if (choice === 'SKIP') {
      get().skipCurrent();
      return;
    }

    set({ loading: true, error: null });

    try {
      // Save prediction to API
      const predictionData: CreatePredictionDto = {
        userId,
        fixtureId: currentFixture.fixtureId,
        choice,
        week: currentWeek,
        mode,
      };

      console.log('[GameStore] Sending prediction data:', JSON.stringify(predictionData, null, 2));
      await predictionsApi.createPrediction(predictionData);

      // Update local state
      const newPredictions = new Map(predictions);
      newPredictions.set(currentFixture.fixtureId, choice);

      set({ predictions: newPredictions, loading: false });

      console.log(`[GameStore] Prediction saved: ${choice} for ${currentFixture.fixtureId}`);

      // Move to next card after short delay
      setTimeout(() => {
        get().nextCard();
      }, 300);
    } catch (error: any) {
      console.error('[GameStore] Error saving prediction:', error);
      set({ loading: false, error: error.message });
    }
  },

  // Skip current card
  skipCurrent: () => {
    const { fixtures, currentIndex, skippedFixtures } = get();
    const currentFixture = fixtures[currentIndex];

    if (currentFixture && !skippedFixtures.includes(currentFixture.fixtureId)) {
      set({
        skippedFixtures: [...skippedFixtures, currentFixture.fixtureId],
      });
    }

    get().nextCard();
  },

  // Navigate to next card
  nextCard: () => {
    const { fixtures, currentIndex, predictions, skippedFixtures } = get();

    // Check if we're at the end of all fixtures
    if (currentIndex >= fixtures.length - 1) {
      // First, check if game is complete
      const now = new Date();

      // Count actual predictions (1, X, 2) - not SKIP
      const actualPredictions = Array.from(predictions.values()).filter(
        (p) => p !== 'SKIP'
      ).length;

      // Count missed games (already started)
      const missedGames = fixtures.filter(
        (fixture) => new Date(fixture.kickoff.iso) <= now
      ).length;

      // Complete when actual predictions + missed games = total fixtures
      // Example: 3 predictions + 7 missed games = 10/10
      const isGameComplete = actualPredictions + missedGames >= fixtures.length;

      if (isGameComplete) {
        console.log('[GameStore] Game complete:', {
          actualPredictions,
          missedGames,
          total: fixtures.length,
        });
        set({ isComplete: true, showSummary: true });
        return;
      }

      // Only loop back to skipped fixtures if game is NOT complete
      if (skippedFixtures.length > 0) {
        // Find first skipped fixture
        const nextSkippedIndex = fixtures.findIndex((f) =>
          skippedFixtures.includes(f.fixtureId)
        );

        if (nextSkippedIndex !== -1) {
          set({ currentIndex: nextSkippedIndex });
          return;
        }
      }

      // If we get here, no skipped fixtures and not complete - stay at current
      return;
    }

    set({ currentIndex: currentIndex + 1 });
  },

  // Navigate to previous card
  previousCard: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  // Go to specific card
  goToCard: (index: number) => {
    const { fixtures } = get();
    if (index >= 0 && index < fixtures.length) {
      set({ currentIndex: index });
    }
  },

  // Reset game (delete all predictions)
  resetGame: async (userId: string) => {
    const { currentWeek, mode } = get();

    set({ loading: true, error: null });

    try {
      await predictionsApi.deleteUserPredictions(userId, mode);

      // Reload the week
      await get().loadWeek(currentWeek, mode, userId);

      console.log('[GameStore] Game reset successfully');
    } catch (error: any) {
      console.error('[GameStore] Error resetting game:', error);
      set({ loading: false, error: error.message });
    }
  },

  // Toggle summary screen
  toggleSummary: () => {
    set((state) => ({ showSummary: !state.showSummary }));
  },

  // Set mode
  setMode: (mode: 'live' | 'test') => {
    set({ mode });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

export default useGameStore;
