import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type RegisterScreenProps = {
  onNavigate: (screen: 'Welcome' | 'Login' | 'Register') => void;
};

export default function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Screen</Text>
      <Text style={styles.subtitle}>To be implemented</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => onNavigate('Welcome')}
      >
        <Text style={styles.buttonText}>Back to Welcome</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
