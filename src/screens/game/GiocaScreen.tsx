import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAuthStore } from "../../store/stores/useAuthStore";
import { useGameStore } from "../../store/stores/useGameStore";
import { PredictionChoice } from "../../types/game.types";
import { colors, spacing } from "../../theme";
import GameHeader from "../../components/game/GameHeader";
import MatchCard from "../../components/game/MatchCard";
import PredictionButtons from "../../components/game/PredictionButtons";
import GameSummaryScreen from "../../components/game/GameSummaryScreen";
import GuestCTA from "../../components/common/GuestCTA";
import {
  getNextDeadline,
  getNextInDeck,
  getPlayableDeck,
  getRoundProgress,
  isRoundOver,
} from "../../utils/gameDeck";

const { height: screenHeight } = Dimensions.get("window");
const isSmallScreen = screenHeight < 750;

export default function GiocaScreen() {
  // Selettore: re-render solo quando cambia user (non loading/error auth)
  const user = useAuthStore((s) => s.user);
  // Selettori per campo: lo screen non si ri-renderizza per cambi di parti
  // dello store che non consuma (le azioni Zustand hanno riferimenti stabili).
  const currentWeek = useGameStore((s) => s.currentWeek);
  const mode = useGameStore((s) => s.mode);
  const fixtures = useGameStore((s) => s.fixtures);
  const predictions = useGameStore((s) => s.predictions);
  const loading = useGameStore((s) => s.loading);
  const error = useGameStore((s) => s.error);
  const loadLiveWeek = useGameStore((s) => s.loadLiveWeek);
  const makePrediction = useGameStore((s) => s.makePrediction);
  const resetGame = useGameStore((s) => s.resetGame);

  const [headerHeight, setHeaderHeight] = useState(160);
  // Card mostrata, identificata dal fixtureId e non da un indice: il mazzo si
  // accorcia da solo quando una partita scade, e un indice resterebbe appeso.
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  // Il mazzo dipende dall'ora, quindi va ricalcolato mentre lo schermo e'
  // aperto: una partita puo' iniziare proprio mentre l'utente la guarda.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Load fixtures on mount (only if not already loaded)
  useEffect(() => {
    // In modalita' ospite non c'e' userId: le fixture pubbliche si caricano
    // lo stesso, solo senza i pronostici personali.
    if (fixtures.length === 0) {
      console.log("[GiocaScreen] Initial load - loading live week");
      loadLiveWeek(user?.uid ?? "");
    }
  }, [user]);



  // Il mazzo: solo partite non iniziate e non ancora giocate, in ordine di
  // scadenza. Tutto il resto della schermata deriva da qui.
  const deck = useMemo(
    () => getPlayableDeck(fixtures, predictions, now),
    [fixtures, predictions, now]
  );
  const roundOver = isRoundOver(fixtures, predictions, now);
  const progress = getRoundProgress(fixtures, predictions, now);

  // La card corrente resta valida anche se il mazzo si accorcia sotto di lei.
  const currentFixture =
    deck.find((fixture) => fixture.fixtureId === currentId) ?? deck[0];
  const nextFixture = deck.find(
    (fixture) => fixture.fixtureId !== currentFixture?.fixtureId
  );

  const canSwipe = !loading && !!currentFixture;

  useEffect(() => {
    if (roundOver && !user) {
      setShowGuestPrompt(true);
    }
  }, [roundOver, user]);

  const handlePrediction = async (choice: PredictionChoice) => {
    if (!currentFixture) return;

    // Skip: rimanda dentro il mazzo, senza uscire dalle giocabili.
    if (choice === "SKIP") {
      setCurrentId(getNextInDeck(deck, currentFixture.fixtureId));
      return;
    }

    // Chi arriva qui e' per forza giocabile: le card iniziate non si mostrano.
    const target = currentFixture.fixtureId;
    setCurrentId(getNextInDeck(deck, target));
    await makePrediction(choice, user?.uid ?? "", target);
  };

  const handleReset = async () => {
    if (!user) return;
    await resetGame(user.uid);
    setCurrentId(null);
  };

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
          onPress={() => loadLiveWeek(user?.uid ?? "")}
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
    <>
      <View style={styles.container}>
        {/* Header with progress - becomes sticky when summary shows */}
        <GameHeader
          currentWeek={currentWeek}
          totalFixtures={progress.total}
          completedPredictions={progress.resolved}
          nextKickoff={getNextDeadline(deck)}
          mode={mode}
          fixtures={fixtures}
          onReset={handleReset}
          loading={loading}
          sticky={roundOver}
          onHeightChange={setHeaderHeight}
        />

        {/* Conditionally render Summary or Normal Game View */}
        {roundOver ? (
          <GameSummaryScreen
            fixtures={fixtures}
            predictions={predictions}
            headerHeight={headerHeight}
          />
        ) : (
          <>
            {/* Main Card Area */}
            <View style={styles.cardContainer}>
              {currentFixture ? (
                <>
                  {/* Card Stack Container */}
                  <View style={styles.cardStack}>
                    {/* Preview Card (Next Card) - Behind */}
                    {nextFixture && (
                      <View style={styles.previewCard}>
                        <View style={styles.previewCardInner}>
                          <MatchCard
                            key={`preview-${nextFixture.fixtureId}`}
                            matchCard={nextFixture}
                            isPreview
                          />
                        </View>
                      </View>
                    )}

                    {/* Current Card - On Top */}
                    <View style={styles.currentCard}>
                      <MatchCard
                        key={currentFixture.fixtureId}
                        matchCard={currentFixture}
                        onSwipe={handlePrediction}
                        enabled={canSwipe}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.centerContainer}>
                  <Text style={styles.emptyText}>
                    Nessuna partita selezionata
                  </Text>
                </View>
              )}
            </View>

            {/* Prediction Buttons — nel mazzo ci sono solo partite mai
                giocate, quindi i tasti sono sempre quelli di scelta. */}
            {currentFixture && (
              <View style={styles.buttonsContainer}>
                <PredictionButtons
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
          </>
        )}
      </View>

      {/* Guest mode: invito alla registrazione quando si prova a pronosticare */}
      <Modal
        visible={showGuestPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuestPrompt(false)}
      >
        <View style={styles.guestModalOverlay}>
          <View style={styles.guestModalCard}>
            <TouchableOpacity
              style={styles.guestModalClose}
              onPress={() => setShowGuestPrompt(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.guestModalCloseText}>✕</Text>
            </TouchableOpacity>
            <GuestCTA
              title="Hai completato la giornata!"
              message="Registrati per salvare i tuoi pronostici, vedere il tuo punteggio e scalare la classifica."
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  guestModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(31, 17, 71, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  guestModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  guestModalClose: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  guestModalCloseText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "600",
  },
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
    marginTop: isSmallScreen ? 20 : 40,
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
    position: "absolute",
    bottom: isSmallScreen ? 50 : 120, // Position above bottom nav
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 50, // Above cards
  },
  instructionText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
