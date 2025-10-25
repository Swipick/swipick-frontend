import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LandingScreenProps {
  onNavigate: (screen: "Landing" | "Welcome" | "Login" | "Register" | "EmailVerification" | "LoginVerified", params?: any) => void;
}

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <View style={styles.container}>
      {/* Swipick Logo/Title */}
      <Text style={styles.title}>swipick</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>Ogni giornata fai la tua giocata</Text>

      {/* Team Logos */}
      <View style={styles.logosContainer}>
        <Image
          source={require("../../../src/assets/landingLogos/JuventusFcLogo.png")}
          style={[styles.teamLogo, styles.logoLeft]}
          resizeMode="contain"
        />
        <Image
          source={require("../../../src/assets/landingLogos/NapolLogo.png")}
          style={[styles.teamLogo, styles.logoRight]}
          resizeMode="contain"
        />
      </View>

      {/* Prediction Buttons (Illustrative - Not Active) */}
      <View style={styles.predictionButtonsContainer}>
        <LinearGradient
          colors={["#7956f3", "#5742a4"]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.predictionButton}
        >
          <Text style={styles.predictionButtonText}>1</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#7956f3", "#5742a4"]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={[styles.predictionButton, styles.predictionButtonMiddle]}
        >
          <Text style={styles.predictionButtonText}>X</Text>
        </LinearGradient>

        <LinearGradient
          colors={["#7956f3", "#5742a4"]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.predictionButton}
        >
          <Text style={styles.predictionButtonText}>2</Text>
        </LinearGradient>
      </View>

      {/* Page Indicator Dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </View>

      {/* Auth Buttons Container */}
      <View style={styles.authButtonsContainer}>
        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => onNavigate("Login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => onNavigate("Register")}
        >
          <Text style={styles.registerButtonText}>Registrati</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#5742a4",
    marginTop: 40,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "400",
  },
  logosContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    marginTop: 40,
  },
  teamLogo: {
    width: 100,
    height: 100,
  },
  logoLeft: {
    transform: [{ rotate: "-15deg" }],
  },
  logoRight: {
    transform: [{ rotate: "15deg" }],
  },
  predictionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 40,
  },
  predictionButton: {
    width: 80,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  predictionButtonMiddle: {
    marginBottom: 40,
  },
  predictionButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 40,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 25,
  },
  dotActive: {
    backgroundColor: "#4d32b1ff",
  },
  dotInactive: {
    backgroundColor: "rgba(179, 172, 203, 0.3)",
  },
  authButtonsContainer: {
    width: "100%",
    gap: 12,
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4d32b1ff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(111, 73, 247, 0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
