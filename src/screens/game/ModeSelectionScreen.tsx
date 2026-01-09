import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type ModeSelectionScreenProps = {
  onNavigate?: (screen: 'Landing' | 'Welcome' | 'Login' | 'Register' | 'EmailVerification' | 'LoginVerified' | 'ModeSelection', params?: any) => void;
};

/**
 * Mode Selection Screen (Placeholder)
 * User chooses between Live Mode and Test Mode
 */
export default function ModeSelectionScreen({ onNavigate }: ModeSelectionScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleziona Modalità</Text>
      <Text style={styles.subtitle}>Scegli come vuoi giocare</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.modeButton}>
          <Text style={styles.modeButtonTitle}>🔴 Live Mode</Text>
          <Text style={styles.modeButtonDesc}>
            Gioca con partite in tempo reale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton}>
          <Text style={styles.modeButtonTitle}>🧪 Test Mode</Text>
          <Text style={styles.modeButtonDesc}>
            Modalità di prova e allenamento
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.successMessage}>
        ✅ Login completato con successo!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5742a4",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 48,
    textAlign: "center",
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  modeButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#6f49f7",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modeButtonTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6f49f7",
    marginBottom: 8,
  },
  modeButtonDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#10B981",
    marginTop: 48,
    textAlign: "center",
  },
});
