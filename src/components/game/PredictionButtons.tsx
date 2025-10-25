import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PredictionChoice } from "../../types/game.types";

interface PredictionButtonsProps {
  currentPrediction?: "1" | "X" | "2";
  disabled?: boolean;
  isSkipAnimating?: boolean;
  onAnimateAndCommit: (direction: "up" | "down" | "left" | "right") => void;
}

/**
 * Diamond-layout prediction buttons matching PWA design
 *
 * Layout:
 *       [X]       ← Top (Draw)
 *  [1]     [2]    ← Middle (Home | Away)
 *     [skip]      ← Bottom (Skip)
 */
export default function PredictionButtons({
  currentPrediction,
  disabled = false,
  isSkipAnimating = false,
  onAnimateAndCommit,
}: PredictionButtonsProps) {
  const isPredictionDisabled = disabled || isSkipAnimating;
  const isSkipDisabled = disabled;

  return (
    <View style={styles.container}>
      {/* X Button - Top Center */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => onAnimateAndCommit("up")}
          disabled={isPredictionDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#7956f3", "#5742a4"]}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.predictionButton,
              currentPrediction === "X" && styles.selectedButton,
              isPredictionDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.predictionButtonText}>X</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 1 and 2 Buttons - Middle Row */}
      <View style={styles.middleRow}>
        <TouchableOpacity
          onPress={() => onAnimateAndCommit("left")}
          disabled={isPredictionDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#7956f3", "#5742a4"]}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.predictionButton,
              currentPrediction === "1" && styles.selectedButton,
              isPredictionDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.predictionButtonText}>1</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onAnimateAndCommit("right")}
          disabled={isPredictionDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#7956f3", "#5742a4"]}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.predictionButton,
              currentPrediction === "2" && styles.selectedButton,
              isPredictionDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.predictionButtonText}>2</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Skip Button - Bottom Center */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={() => onAnimateAndCommit("down")}
          disabled={isSkipDisabled}
          activeOpacity={0.8}
        >
          <View
            style={[styles.skipButton, isSkipDisabled && styles.disabledButton]}
          >
            <Text style={styles.skipButtonText}>skip</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  topRow: {
    alignItems: "center",
  },
  middleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 155,
  },
  bottomRow: {
    alignItems: "center",
    marginTop: -12, // Pull up slightl
  },
  predictionButton: {
    width: 80,
    height: 45,
    borderRadius: 15, // Pill shape (half of height)
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  selectedButton: {
    transform: [{ scale: 1.05 }],
  },
  disabledButton: {
    opacity: 0.6,
  },
  predictionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  skipButton: {
    width: 80,
    height: 45,
    borderRadius: 15, // Pill shape (half of height)
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skipButtonText: {
    color: "#3d2d73",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
