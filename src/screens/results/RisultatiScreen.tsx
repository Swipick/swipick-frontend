import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Animated,
  Image,
  Dimensions,
} from "react-native";

const { height: screenHeight } = Dimensions.get("window");
const isSmallScreen = screenHeight < 750;
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import ConfettiCannon from "react-native-confetti-cannon";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/stores/useAuthStore";
import { predictionsApi } from "../../services/api/predictions";
import { fixturesApi } from "../../services/api/fixtures";
import { colors, spacing } from "../../theme";
import {
  PredictionChoice,
  WeeklyStats,
  FixtureWithResult,
} from "../../types/game.types";
import { getTeamLogo } from "../../utils/logoMapper";

type RisultatiScreenProps = {
  mode?: "live" | "test";
};

interface MatchResult {
  fixtureId: string;
  home: { name: string; logo: any; score: number | null };
  away: { name: string; logo: any; score: number | null };
  userPrediction: PredictionChoice | null;
  actualResult: "1" | "X" | "2" | null;
  isCorrect: boolean | null;
  kickoff: string;
  status: string;
}

export default function RisultatiScreen({
  mode = "live",
}: RisultatiScreenProps) {
  const { user } = useAuthStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [fixturesWithResults, setFixturesWithResults] = useState<
    FixtureWithResult[]
  >([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [recentlyRevealed, setRecentlyRevealed] = useState<{
    id: string;
    origin: { x: number; y: number };
  } | null>(null);
  const confettiRef = useRef<ConfettiCannon>(null);

  // Fetch the current week on mount and set to previous week
  useEffect(() => {
    const initializeWeek = async () => {
      try {
        const currentWeek = await fixturesApi.getLiveWeek();
        // Set to previous week (minimum week 1)
        const previousWeek = Math.max(1, currentWeek - 1);
        console.log(`[RisultatiScreen] Current week: ${currentWeek}, loading previous week: ${previousWeek}`);
        setSelectedWeek(previousWeek);
      } catch (error) {
        console.error("[RisultatiScreen] Error fetching current week:", error);
        // Fallback to week 1 if API fails
        setSelectedWeek(1);
      }
    };

    initializeWeek();
  }, []);

  // Get AsyncStorage key for reveal state
  const getRevealKey = (week: number, userId: string) => {
    return `@swipick:revealed:${mode}:week${week}:${userId}`;
  };

  // Load revealed state from AsyncStorage
  const loadRevealedState = async (week: number, userId: string) => {
    try {
      const key = getRevealKey(week, userId);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(
          "[RisultatiScreen] Loaded revealed state:",
          Object.keys(parsed).length,
          "revealed"
        );
        setRevealed(parsed);
      } else {
        setRevealed({});
      }
    } catch (error) {
      console.error("[RisultatiScreen] Error loading revealed state:", error);
      setRevealed({});
    }
  };

  // Save revealed state to AsyncStorage
  const saveRevealedState = async (
    week: number,
    userId: string,
    state: Record<string, boolean>
  ) => {
    try {
      const key = getRevealKey(week, userId);
      await AsyncStorage.setItem(key, JSON.stringify(state));
      console.log(
        "[RisultatiScreen] Saved revealed state:",
        Object.keys(state).length,
        "revealed"
      );
    } catch (error) {
      console.error("[RisultatiScreen] Error saving revealed state:", error);
    }
  };

  // Load fixtures and predictions for selected week
  useEffect(() => {
    if (selectedWeek !== null) {
      loadWeekData();
    }
  }, [selectedWeek, user]);

  const loadWeekData = async () => {
    if (!user || selectedWeek === null) return;

    // Only show full loading on initial load
    if (fixturesWithResults.length === 0) {
      setLoading(true);
    } else {
      setContentLoading(true);
    }

    try {
      console.log("[RisultatiScreen] Loading data for week", selectedWeek);

      // Load fixtures with results for the week
      const fixturesData = await fixturesApi.getFixturesWithResults(
        selectedWeek
      );
      console.log(
        "[RisultatiScreen] Fixtures with results loaded:",
        fixturesData.length
      );
      setFixturesWithResults(fixturesData);

      // Load user's predictions for the week
      const stats = await predictionsApi.getWeeklyPredictions(
        user.uid,
        selectedWeek,
        mode
      );
      console.log(
        "[RisultatiScreen] Predictions loaded:",
        stats.predictions.length
      );
      setWeeklyStats(stats);

      // Load revealed state from AsyncStorage
      await loadRevealedState(selectedWeek, user.uid);
    } catch (error) {
      console.error("[RisultatiScreen] Error loading data:", error);
      Alert.alert("Errore", "Impossibile caricare i risultati");
    } finally {
      setLoading(false);
      setContentLoading(false);
    }
  };

  // Calculate match results with predictions
  const matchResults = useMemo((): MatchResult[] => {
    if (!fixturesWithResults.length || !weeklyStats) return [];

    console.log(
      "[RisultatiScreen] Mapping predictions. Total predictions:",
      weeklyStats.predictions.length
    );
    console.log(
      "[RisultatiScreen] First prediction:",
      JSON.stringify(weeklyStats.predictions[0])
    );
    console.log(
      "[RisultatiScreen] First fixture ID:",
      fixturesWithResults[0]?.id
    );

    const results = fixturesWithResults.map((fixture) => {
      const prediction = weeklyStats.predictions.find(
        (p) => p.fixtureId === fixture.id
      );

      // Use actual scores from backend
      const homeScore = fixture.home_score;
      const awayScore = fixture.away_score;
      const actualResult = fixture.result;

      // Check if prediction is correct
      const isCorrect =
        prediction && actualResult ? prediction.choice === actualResult : null;

      const result = {
        fixtureId: fixture.id,
        home: {
          name: fixture.home_team,
          logo: getTeamLogo(null, fixture.home_team),
          score: homeScore,
        },
        away: {
          name: fixture.away_team,
          logo: getTeamLogo(null, fixture.away_team),
          score: awayScore,
        },
        userPrediction: prediction?.choice || null,
        actualResult,
        isCorrect,
        kickoff: fixture.match_date,
        status: fixture.status,
      };

      console.log(
        `[RisultatiScreen] Match ${fixture.home_team} vs ${fixture.away_team}: prediction=${prediction?.choice}, result=${actualResult}, isCorrect=${isCorrect}`
      );

      return result;
    });

    return results;
  }, [fixturesWithResults, weeklyStats]);

  // Calculate success percentage (only from revealed matches)
  const meter = useMemo(() => {
    if (matchResults.length === 0)
      return { revealed: 0, correct: 0, percent: 0 };

    let revealedCount = 0;
    let correctCount = 0;

    for (const m of matchResults) {
      if (!revealed[m.fixtureId]) continue;
      revealedCount += 1;

      if (m.isCorrect === true) correctCount += 1;
    }

    const percent =
      revealedCount > 0 ? Math.round((correctCount / revealedCount) * 100) : 0;

    return { revealed: revealedCount, correct: correctCount, percent };
  }, [matchResults, revealed]);

  // Fire confetti when a match is recently revealed
  useEffect(() => {
    if (recentlyRevealed) {
      const match = matchResults.find(
        (m) => m.fixtureId === recentlyRevealed.id
      );
      if (match?.isCorrect === true) {
        confettiRef.current?.start();
      }
      setRecentlyRevealed(null);
    }
  }, [recentlyRevealed, matchResults]);

  // Calculate date range for week
  const dateRange = useMemo(() => {
    if (fixturesWithResults.length === 0) return "dal 05/10 al 12/10";

    const times = fixturesWithResults.map((m) =>
      new Date(m.match_date).getTime()
    );
    const min = new Date(Math.min(...times));
    const max = new Date(Math.max(...times));

    const toIt = (d: Date) =>
      d.toLocaleDateString("it-IT", { day: "2-digit", month: "numeric" });

    return `dal ${toIt(min)} al ${toIt(max)}`;
  }, [fixturesWithResults]);

  // Handle share
  const handleShare = async () => {
    try {
      let message = `Ho indovinato il ${meter.percent}% delle partite della ${selectedWeek}ª giornata.`;

      // TODO: Add percentile data from API
      // if (percentileData?.totalPlayers > 0 && percentileData.percentile > 0) {
      //   message += ` Sono nel ${percentileData.percentile}% dei migliori.`;
      // }

      message += `\nE tu?`;
      message += `\n\nhttps://swipick-frontend-production.up.railway.app/risultati?mode=live`;

      await Share.share({
        title: `Giornata ${selectedWeek} — Swipick`,
        message,
      });
    } catch (error) {
      console.error("[RisultatiScreen] Share error:", error);
    }
  };

  // Handle reveal with confetti
  const handleReveal = async (
    fixtureId: string,
    origin: { x: number; y: number }
  ) => {
    if (!user || selectedWeek === null) return;

    const match = matchResults.find((m) => m.fixtureId === fixtureId);

    // Check if match has finished
    if (!match?.actualResult) {
      Alert.alert(
        "Il risultato non è ancora disponibile",
        "La partita non è ancora terminata."
      );
      return;
    }

    // Update revealed state
    const newRevealed = { ...revealed, [fixtureId]: true };
    setRevealed(newRevealed);

    // Save to AsyncStorage
    await saveRevealedState(selectedWeek, user.uid, newRevealed);

    // Set recently revealed with origin for confetti
    setRecentlyRevealed({ id: fixtureId, origin });
  };

  const handlePreviousWeek = () => {
    setSelectedWeek((prev) => prev !== null ? Math.max(1, prev - 1) : 1);
  };

  const handleNextWeek = () => {
    setSelectedWeek((prev) => prev !== null ? Math.min(38, prev + 1) : 1);
  };

  if (loading || selectedWeek === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Caricamento risultati...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Header with Frosted Glass */}
        <View style={styles.stickyHeaderContainer}>
          {/* Week Selector Header with Gradient */}
          <LinearGradient
            colors={["#554099", "#3d2d73"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.headerGradient}
          >
            {/* Week Navigation */}
            <View style={styles.weekSelector}>
              <TouchableOpacity
                onPress={handlePreviousWeek}
                disabled={selectedWeek === 1 || contentLoading}
                style={styles.sideWeek}
              >
                <Text
                  style={[
                    styles.sideWeekText,
                    {
                      opacity: selectedWeek === 1 || contentLoading ? 0.1 : 0.3,
                    },
                  ]}
                >
                  Giornata {selectedWeek - 1}
                </Text>
              </TouchableOpacity>

              <View style={styles.centerWeek}>
                <Text style={styles.currentWeekTitle}>
                  Giornata {selectedWeek}
                </Text>
                <Text style={styles.dateRangeText}>{dateRange}</Text>
              </View>

              <TouchableOpacity
                onPress={handleNextWeek}
                disabled={selectedWeek === 38 || contentLoading}
                style={styles.sideWeek}
              >
                <Text
                  style={[
                    styles.sideWeekText,
                    {
                      opacity:
                        selectedWeek === 38 || contentLoading ? 0.1 : 0.6,
                    },
                  ]}
                >
                  Giornata {selectedWeek + 1}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Meter Container - Frosted Glass Background */}
          <BlurView
            intensity={40}
            tint="light"
            style={styles.meterContainerWrapper}
          >
            <View style={styles.meterContainer}>
              <CircularMeter percent={meter.percent} />

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.shareText}>Condividi risultato</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Match Results List */}
        {contentLoading ? (
          <View style={styles.contentLoadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.matchList}>
            {matchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nessuna predizione per questa settimana
                </Text>
              </View>
            ) : (
              matchResults.map((match) => (
                <MatchCard
                  key={match.fixtureId}
                  match={match}
                  isRevealed={revealed[match.fixtureId]}
                  onReveal={handleReveal}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Confetti Cannon */}
      <ConfettiCannon
        ref={confettiRef}
        count={90}
        origin={recentlyRevealed?.origin || { x: 0, y: 0 }}
        colors={["#6366f1", "#ffffff"]}
        fadeOut
        autoStart={false}
      />
    </View>
  );
}

// Circular Meter Component with SVG
function CircularMeter({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  // Arc properties - smaller on small screens
  const radius = isSmallScreen ? 67 : 84;
  const strokeWidth = isSmallScreen ? 12 : 16;

  // The path is the same for both background and progress
  // Scaled path for small screens
  const arcPath = isSmallScreen
    ? "M 14 82 A 67 67 0 0 1 146 82"
    : "M 18 102 A 84 84 0 0 1 182 102";

  // Calculate the total length of the semicircle arc
  // Arc length = radius × angle (in radians)
  // Semicircle = π radians, so length = radius × π
  const arcLength = radius * Math.PI;

  // Calculate how much of the arc to show based on percentage
  const progressLength = (arcLength * clamped) / 100;

  // strokeDasharray: [length to draw, length to leave empty]
  // strokeDashoffset: how much to offset the start of the dash
  const dashArray = `${progressLength} ${arcLength}`;

  // SVG dimensions
  const svgWidth = isSmallScreen ? 160 : 200;
  const svgHeight = isSmallScreen ? 88 : 110;
  const viewBox = isSmallScreen ? "0 0 160 88" : "0 0 200 110";

  return (
    <View style={styles.meter}>
      <Svg width={svgWidth} height={svgHeight} viewBox={viewBox}>
        <Defs>
          <SvgLinearGradient
            id="meterGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#c4b5fd" />
            <Stop offset="100%" stopColor="#7c3aed" />
          </SvgLinearGradient>
        </Defs>

        {/* Background arc - rounded caps */}
        <Path
          d={arcPath}
          stroke="#ece9f7"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress arc - uses dasharray to show only a portion */}
        {clamped > 0 && (
          <Path
            d={arcPath}
            stroke="url(#meterGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
          />
        )}
      </Svg>

      {/* Percentage label */}
      <Text style={styles.percentText}>{clamped}%</Text>
    </View>
  );
}

// Match Card Component
function MatchCard({
  match,
  isRevealed,
  onReveal,
}: {
  match: MatchResult;
  isRevealed: boolean;
  onReveal: (fixtureId: string, origin: { x: number; y: number }) => void;
}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<View>(null);

  const handleRevealPress = () => {
    // If match not finished, shake the button
    if (!match.actualResult || match.status !== "FINISHED") {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        "Partita non terminata",
        "Il risultato non è ancora disponibile"
      );
      return;
    }

    // Measure button position for confetti origin
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const origin = {
        x: pageX + width / 2,
        y: pageY + height / 2,
      };
      onReveal(match.fixtureId, origin);
    });
  };

  return (
    <View style={styles.matchCard}>
      {/* Teams Section */}
      <View style={styles.teamsColumn}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          {match.home.logo ? (
            <Image
              source={match.home.logo}
              style={styles.teamLogoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.teamLogoFallback}>
              <Text style={styles.teamLogoText}>
                {match.home.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>
            {match.home.name}
          </Text>
        </View>

        {/* Away Team */}
        <View style={styles.teamRow}>
          {match.away.logo ? (
            <Image
              source={match.away.logo}
              style={styles.teamLogoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.teamLogoFallback}>
              <Text style={styles.teamLogoText}>
                {match.away.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.teamName} numberOfLines={1}>
            {match.away.name}
          </Text>
        </View>
      </View>

      {/* Scores Section */}
      <View style={styles.scoresColumn}>
        <Text style={styles.score}>
          {isRevealed
            ? match.home.score !== null
              ? match.home.score
              : "ND"
            : "–"}
        </Text>
        <Text style={styles.score}>
          {isRevealed
            ? match.away.score !== null
              ? match.away.score
              : "ND"
            : "–"}
        </Text>
      </View>

      {/* Reveal Button Section */}
      <Animated.View
        ref={buttonRef}
        style={[
          styles.buttonColumn,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {!isRevealed ? (
          <TouchableOpacity
            style={styles.revealButton}
            onPress={handleRevealPress}
            activeOpacity={0.7}
          >
            <Text style={styles.revealButtonText}>MOSTRA</Text>
            <Text style={styles.revealButtonText}>RISULTATO</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finishedButton} pointerEvents="none">
            <Text style={styles.finishedButtonText}>FINE</Text>
            <Text style={styles.finishedButtonText}>PARTITA</Text>
          </View>
        )}
      </Animated.View>

      {/* Prediction Badges Section */}
      <View style={styles.badgesColumn}>
        {(["1", "X", "2"] as const).map((choice) => {
          const isUserChoice = match.userPrediction === choice;
          const isActualResult = isRevealed && match.actualResult === choice;
          const isCorrectChoice =
            isRevealed && isUserChoice && match.isCorrect === true;
          const isWrongChoice =
            isRevealed && isUserChoice && match.isCorrect === false;

          // Show green for actual result (always), red for wrong user prediction
          const showAsCorrect = isActualResult;
          const showAsWrong = isWrongChoice && !isActualResult;

          return (
            <View
              key={choice}
              style={[
                styles.badge,
                !isUserChoice && !isActualResult && styles.badgeDefault,
                isUserChoice && !isRevealed && styles.badgeSelected,
                showAsCorrect && styles.badgeCorrect,
                showAsWrong && styles.badgeWrong,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  !isUserChoice && !isActualResult && styles.badgeTextDefault,
                  isUserChoice && !isRevealed && styles.badgeTextSelected,
                  (showAsCorrect || showAsWrong) && styles.badgeTextResult,
                ]}
              >
                {choice}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  contentLoadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },

  // Sticky Header - Frosted Glass Container
  stickyHeaderContainer: {
    backgroundColor: "transparent", // Allow blur to show through
    zIndex: 30, // Above scrollable content
    paddingBottom: 8, // pb-2
  },
  headerGradient: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: isSmallScreen ? 35 : 60,
    paddingHorizontal: 16,
    paddingBottom: isSmallScreen ? 12 : 20, // Extend to overlap with blur
    shadowColor: "#554099",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1, // Layer above blur
  },
  meterContainerWrapper: {
    paddingHorizontal: 16, // px-4
    paddingTop: 0, // No top padding
    paddingBottom: 8, // pb-2
    marginTop: -20, // Move up by 20px to overlap header
    overflow: "hidden", // Required for BlurView
  },
  weekSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 12 : 24,
    minHeight: isSmallScreen ? 40 : 60,
  },
  sideWeek: {
    flex: 1,
  },
  sideWeekText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "500",
    color: "#fff",
  },
  centerWeek: {
    flex: 2,
    alignItems: "center",
  },
  currentWeekTitle: {
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: "bold",
    color: "#fff",
  },
  dateRangeText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: isSmallScreen ? 4 : 8,
  },

  // Success Meter
  meterContainer: {
    alignItems: "center",
    paddingVertical: isSmallScreen ? 6 : 12,
  },
  meter: {
    width: isSmallScreen ? 160 : 200,
    height: isSmallScreen ? 88 : 110,
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    position: "absolute",
    top: "58%",
    fontSize: isSmallScreen ? 22 : 28,
    fontWeight: "bold",
    color: "#000",
  },

  // Share Button
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallScreen ? 6 : 8,
    backgroundColor: "#312e81",
    paddingHorizontal: 8,
    paddingVertical: isSmallScreen ? 10 : 16,
    borderRadius: 12,
    width: isSmallScreen ? 170 : 200,
    justifyContent: "center",
    marginTop: isSmallScreen ? 4 : 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareText: {
    color: "#fff",
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
  },

  // Match List
  matchList: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Match Card
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 10 : 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    gap: isSmallScreen ? 8 : 12,
  },

  // Teams Column
  teamsColumn: {
    flex: 1,
    gap: isSmallScreen ? 8 : 12,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: isSmallScreen ? 8 : 12,
    height: isSmallScreen ? 40 : 56,
  },
  teamLogoImage: {
    width: isSmallScreen ? 32 : 48,
    height: isSmallScreen ? 32 : 48,
  },
  teamLogoFallback: {
    width: isSmallScreen ? 32 : 48,
    height: isSmallScreen ? 32 : 48,
    backgroundColor: "#f9fafb",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  teamLogoText: {
    fontSize: isSmallScreen ? 14 : 20,
    fontWeight: "bold",
    color: "#6366f1",
  },
  teamName: {
    flex: 1,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
    color: "#000",
  },

  // Scores Column
  scoresColumn: {
    gap: isSmallScreen ? 8 : 12,
    minWidth: isSmallScreen ? 24 : 30,
    alignItems: "center",
  },
  score: {
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: "600",
    color: "#000",
    height: isSmallScreen ? 40 : 56,
    lineHeight: isSmallScreen ? 40 : 56,
    textAlign: "center",
    minWidth: isSmallScreen ? 14 : 16,
  },

  // Button Column
  buttonColumn: {
    minWidth: isSmallScreen ? 56 : 72,
  },
  revealButton: {
    backgroundColor: "rgba(99, 102, 241, 0.9)",
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 6,
    alignItems: "center",
  },
  revealButtonText: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: "600",
    color: "#fff",
    lineHeight: isSmallScreen ? 12 : 14,
  },
  finishedButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 6,
    alignItems: "center",
  },
  finishedButtonText: {
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: "600",
    color: "#374151",
    lineHeight: isSmallScreen ? 12 : 14,
  },

  // Prediction Badges
  badgesColumn: {
    gap: isSmallScreen ? 6 : 8,
  },
  badge: {
    width: isSmallScreen ? 26 : 32,
    height: isSmallScreen ? 26 : 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDefault: {
    backgroundColor: "#f3f4f6",
  },
  badgeSelected: {
    backgroundColor: "#e0e7ff",
    borderWidth: 2,
    borderColor: "#818cf8",
  },
  badgeCorrect: {
    backgroundColor: "#ccffb3",
  },
  badgeWrong: {
    backgroundColor: "#ffb3b3",
  },
  badgeText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: "600",
  },
  badgeTextDefault: {
    color: "#374151",
  },
  badgeTextSelected: {
    color: "#4338ca",
  },
  badgeTextResult: {
    color: "#000",
  },
});
