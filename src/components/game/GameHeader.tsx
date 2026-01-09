import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../theme";
import CountdownTimer from "./CountdownTimer";
import ProgressBar from "./ProgressBar";
import { MatchCard } from "../../types/game.types";

const { height: screenHeight } = Dimensions.get("window");
const isSmallScreen = screenHeight < 750;

interface GameHeaderProps {
  currentWeek: number;
  totalFixtures: number;
  completedPredictions: number;
  mode: "live" | "test";
  fixtures: MatchCard[];
  onReset: () => void;
  loading?: boolean;
  sticky?: boolean;
  onHeightChange?: (height: number) => void;
}

export default function GameHeader({
  currentWeek,
  totalFixtures,
  completedPredictions,
  mode,
  fixtures,
  sticky = false,
  onHeightChange,
}: GameHeaderProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [shareLoading, setShareLoading] = useState(false);

  // Share functionality
  const handleShare = async () => {
    setShareLoading(true);
    try {
      const result = await Share.share({
        title: "Swipick - Previsioni Calcio",
        message:
          "Ho fatto su Swipick le mie previsioni per la prossima giornata di calcio. Puoi battermi? https://swipick-frontend-production.up.railway.app/registro",
      });

      if (result.action === Share.sharedAction) {
        console.log("[GameHeader] Successfully shared!");
      } else if (result.action === Share.dismissedAction) {
        console.log("[GameHeader] Share dismissed");
      }
    } catch (error) {
      Alert.alert("Errore", "Impossibile condividere in questo momento.");
      console.error("[GameHeader] Share error:", error);
    } finally {
      setShareLoading(false);
    }
  };

  // Calculate week date range
  const getWeekDateRange = (): string => {
    if (fixtures.length === 0) return "";

    const dates = fixtures
      .map((f) => new Date(f.kickoff.iso))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1; // Get month as number
      return `${day}/${month}`;
    };

    return `dal ${formatDate(firstDate)} al ${formatDate(lastDate)}`;
  };

  // Find next match kickoff time
  const getNextMatchDate = (): Date | null => {
    if (fixtures.length === 0) return null;

    const now = new Date();
    const futureDates = fixtures
      .map((f) => new Date(f.kickoff.iso))
      .filter((date) => date.getTime() > now.getTime())
      .sort((a, b) => a.getTime() - b.getTime());

    return futureDates.length > 0 ? futureDates[0] : null;
  };

  const nextMatchDate = getNextMatchDate();
  const weekDateRange = getWeekDateRange();

  return (
    <LinearGradient
      colors={["#52418d", "#7a57f6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, sticky && styles.sticky]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        if (height !== headerHeight) {
          setHeaderHeight(height);
          onHeightChange?.(height);
        }
      }}
    >
      {/* Mode Badge */}
      {mode === "test" && (
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>MODALITÀ TEST</Text>
        </View>
      )}

      {/* Week Header */}
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>
          Giornata {currentWeek} {weekDateRange}
        </Text>
      </View>

      {/* Countdown Timer */}
      {nextMatchDate && (
        <View style={styles.countdownContainer}>
          <CountdownTimer targetDate={nextMatchDate} />
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ProgressBar
          completed={completedPredictions}
          total={totalFixtures}
          height={24}
        />
      </View>

      {/* Share Button - Only visible when sticky (summary screen) */}
      {sticky && (
        <View style={styles.shareContainer}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[
              styles.shareButton,
              shareLoading && styles.shareButtonDisabled,
            ]}
            onPress={handleShare}
            disabled={shareLoading}
          >
            <Ionicons name="share-social-outline" size={16} color="#7a57f6" />
            <Text style={styles.shareButtonText}>Sfida i tuoi amici</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: isSmallScreen ? 25 : 60, // Account for status bar
    paddingHorizontal: spacing.lg,
    paddingBottom: isSmallScreen ? 8 : spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modeBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 193, 7, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  modeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: isSmallScreen ? 8 : spacing.md,
    position: "relative",
  },
  weekTitle: {
    fontSize: isSmallScreen ? 13 : 16,
    fontWeight: "400",
    color: "#fff",
    textAlign: "center",
  },
  countdownContainer: {
    alignItems: "center",
    marginBottom: isSmallScreen ? 6 : spacing.md,
  },
  progressContainer: {
    marginBottom: 0,
  },
  shareContainer: {
    marginTop: isSmallScreen ? 8 : 12,
    paddingTop: isSmallScreen ? 8 : 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  shareButtonDisabled: {
    backgroundColor: "#E5E5E5",
  },
  shareButtonText: {
    color: "#7a57f6",
    fontSize: 14,
    fontWeight: "600",
  },
});
