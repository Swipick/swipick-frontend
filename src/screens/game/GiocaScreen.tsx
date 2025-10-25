import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/stores/useAuthStore';
import { useGameStore } from '../../store/stores/useGameStore';
import { PredictionChoice } from '../../types/game.types';
import { colors, spacing } from '../../theme';
import GameHeader from '../../components/game/GameHeader';
import SwipeableCard from '../../components/game/SwipeableCard';
import MatchCard from '../../components/game/MatchCard';
import PredictionButtons from '../../components/game/PredictionButtons';
import GameSummaryScreen from '../../components/game/GameSummaryScreen';

export default function GiocaScreen() {
  const { user } = useAuthStore();
  const {
    currentWeek,
    mode,
    fixtures,
    predictions,
    currentIndex,
    loading,
    error,
    isComplete,
    loadLiveWeek,
    makePrediction,
    skipCurrent,
    previousCard,
    nextCard,
    resetGame,
  } = useGameStore();

  const [showSummary, setShowSummary] = useState(false);

  // Load fixtures on mount
  useEffect(() => {
    if (user) {
      loadLiveWeek(user.uid);
    }
  }, [user]);

  // Show summary when all predictions complete
  useEffect(() => {
    if (isComplete) {
      setShowSummary(true);
    }
  }, [isComplete]);

  const handlePrediction = async (choice: PredictionChoice) => {
    if (!user) return;

    if (choice === 'SKIP') {
      skipCurrent();
    } else {
      await makePrediction(choice, user.uid);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    await resetGame(user.uid);
    setShowSummary(false);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
  };

  // Calculate completion stats
  const totalFixtures = fixtures.length;
  const completedPredictions = Array.from(predictions.values()).filter(
    (choice) => choice !== 'SKIP'
  ).length;

  // Get current fixture
  const currentFixture = fixtures[currentIndex];
  const currentPrediction = currentFixture
    ? predictions.get(currentFixture.fixtureId)
    : undefined;

  // Check if current card can be swiped
  const canSwipe = !loading && !!currentFixture && !currentPrediction;

  // Check if navigation buttons should be enabled
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < fixtures.length - 1;

  // Loading state
  if (loading && fixtures.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ Errore</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => user && loadLiveWeek(user.uid)}
        >
          <Text style={styles.retryText}>Riprova</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No fixtures available
  if (!loading && fixtures.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Nessuna partita disponibile</Text>
        <Text style={styles.emptySubtext}>
          Torna più tardi per fare le tue previsioni
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <GameHeader
        currentWeek={currentWeek}
        totalFixtures={totalFixtures}
        completedPredictions={completedPredictions}
        mode={mode}
        fixtures={fixtures}
        onReset={handleReset}
        loading={loading}
      />

      {/* Main Card Area */}
      <View style={styles.cardContainer}>
        {currentFixture ? (
          <>
            {/* Show message if already predicted */}
            {currentPrediction && (
              <View style={styles.predictedBanner}>
                <Text style={styles.predictedText}>
                  {currentPrediction === 'SKIP'
                    ? '⏭️ Partita saltata'
                    : `✓ Hai previsto: ${currentPrediction}`}
                </Text>
              </View>
            )}

            {/* Card Stack Container */}
            <View style={styles.cardStack}>
              {/* Preview Card (Next Card) - Behind */}
              {fixtures[currentIndex + 1] && (
                <View style={styles.previewCard}>
                  <View style={styles.previewCardInner}>
                    <MatchCard matchCard={fixtures[currentIndex + 1]} />
                  </View>
                </View>
              )}

              {/* Current Card - On Top */}
              <View style={styles.currentCard}>
                <SwipeableCard
                  onSwipe={handlePrediction}
                  enabled={canSwipe}
                  index={currentIndex}
                >
                  <MatchCard matchCard={currentFixture} />
                </SwipeableCard>
              </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationRow}>
              <TouchableOpacity
                style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
                onPress={previousCard}
                disabled={!canGoPrevious}
              >
                <Text style={styles.navButtonText}>← Indietro</Text>
              </TouchableOpacity>

              <Text style={styles.cardCounter}>
                {currentIndex + 1} / {totalFixtures}
              </Text>

              <TouchableOpacity
                style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
                onPress={nextCard}
                disabled={!canGoNext}
              >
                <Text style={styles.navButtonText}>Avanti →</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nessuna partita selezionata</Text>
          </View>
        )}
      </View>

      {/* Prediction Buttons */}
      {currentFixture && !currentPrediction && (
        <View style={styles.buttonsContainer}>
          <PredictionButtons onPredict={handlePrediction} disabled={loading} />
          <Text style={styles.instructionText}>
            Tocca un pulsante per prevedere
          </Text>
        </View>
      )}

      {/* Summary Modal */}
      <GameSummaryScreen
        visible={showSummary}
        fixtures={fixtures}
        predictions={predictions}
        onClose={handleCloseSummary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  cardStack: {
    position: 'relative',
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  previewCardInner: {
    width: '100%',
    maxWidth: 384,
    transform: [{ scale: 0.95 }],
    opacity: 0.6,
  },
  currentCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  predictedBanner: {
    position: 'absolute',
    top: 20,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  navButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 100,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  cardCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  buttonsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
  instructionText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
