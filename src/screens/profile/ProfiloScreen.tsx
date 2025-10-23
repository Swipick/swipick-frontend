import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfiloScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilo Screen</Text>
      <Text style={styles.subtitle}>Profile will go here</Text>
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
});
