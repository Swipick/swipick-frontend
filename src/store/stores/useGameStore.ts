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

      weeklyStats.predictions.forEach((pred) => {
        predictionsMap.set(pred.fixtureId, pred.choice);
      });

      set({
        currentWeek: week,
        mode,
        fixtures,
        predictions: predictionsMap,
        currentIndex: 0,
        skippedFixtures: [],
        loading: false,
        isComplete: false,
        showSummary: false,
      });

      console.log(`[GameStore] Loaded ${fixtures.length} fixtures for week ${week}`);
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
      // Check if there are skipped fixtures to show
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

      // All done - check if all predictions made
      const totalPredictions = Array.from(predictions.values()).filter(
        (p) => p !== 'SKIP'
      ).length;

      if (totalPredictions === fixtures.length) {
        set({ isComplete: true, showSummary: true });
      }
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
