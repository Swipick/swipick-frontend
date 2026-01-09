import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type WelcomeScreenProps = {
  onNavigate: (screen: 'Landing' | 'Welcome' | 'Login' | 'Register') => void;
};

export default function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => onNavigate("Landing")}
      >
        <Text style={styles.backButtonText}>← Indietro</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome to Swipick</Text>
      <Text style={styles.subtitle}>Predict football matches with swipes</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => onNavigate('Register')}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#5742a4",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 48,
  },
  button: {
    width: '100%',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#6366f1',
  },
});
