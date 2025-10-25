import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuthStore } from "../../store/stores/useAuthStore";
import { useGameStore } from "../../store/stores/useGameStore";
import { PredictionChoice } from "../../types/game.types";
import { colors, spacing } from "../../theme";
import GameHeader from "../../components/game/GameHeader";
import MatchCard from "../../components/game/MatchCard";
import PredictionButtons from "../../components/game/PredictionButtons";
import GameSummaryScreen from "../../components/game/GameSummaryScreen";

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
    console.log('[GiocaScreen] handlePrediction called with choice:', choice);
    console.log('[GiocaScreen] User exists:', !!user);
    console.log('[GiocaScreen] Current fixture ID:', currentFixture?.fixtureId);

    if (!user) return;

    // Check if fixture has already started
    if (currentFixture) {
      const kickoffTime = new Date(currentFixture.kickoff.iso);
      const now = new Date();

      if (kickoffTime <= now) {
        console.log('[GiocaScreen] Fixture has already started, auto-skipping');
        Alert.alert(
          'Match Started',
          'This match has already started. You cannot predict on matches that have kicked off.',
          [{ text: 'OK', onPress: () => skipCurrent() }]
        );
        return;
      }
    }

    if (choice === "SKIP") {
      console.log('[GiocaScreen] Skipping current card');
      skipCurrent();
    } else {
      console.log('[GiocaScreen] Making prediction:', choice);
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
    (choice) => choice !== "SKIP"
  ).length;

  // Get current fixture
  const currentFixture = fixtures[currentIndex];
  const currentPrediction = currentFixture
    ? predictions.get(currentFixture.fixtureId)
    : undefined;

  // Check if current card can be swiped
  const isFixtureStarted = currentFixture
    ? new Date(currentFixture.kickoff.iso) <= new Date()
    : false;
  const canSwipe = !loading && !!currentFixture && !currentPrediction && !isFixtureStarted;

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
                <MatchCard
                  matchCard={currentFixture}
                  onSwipe={handlePrediction}
                  enabled={canSwipe}
                />
              </View>
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
          <PredictionButtons
            currentPrediction={currentPrediction as "1" | "X" | "2" | undefined}
            disabled={loading}
            isSkipAnimating={false}
            onAnimateAndCommit={(direction) => {
              // Map direction to choice
              const choiceMap = {
                up: "X" as const,
                left: "1" as const,
                right: "2" as const,
                down: "SKIP" as const,
              };
              handlePrediction(choiceMap[direction]);
            }}
          />
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
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 16, // Minimal padding for card
    position: "relative",
  },
  cardStack: {
    position: "relative",
    width: "100%",
    minHeight: 450,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 40,
  },
  previewCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 10,
  },
  previewCardInner: {
    width: "100%",
    maxWidth: 384,
    transform: [{ scale: 0.95 }],
    opacity: 0.6,
  },
  currentCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 30,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
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
    fontWeight: "600",
    color: "#fff",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  navigationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 0,
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
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  cardCounter: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  buttonsContainer: {
    alignItems: "center",
    paddingVertical: 8,
    paddingBottom: 16,
  },
  instructionText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
