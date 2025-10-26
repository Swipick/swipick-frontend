import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../../theme';

type RisultatiScreenProps = {
  mode?: 'live' | 'test';
  week?: number;
};

export default function RisultatiScreen({ mode = 'live', week }: RisultatiScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Risultati</Text>
          <Text style={styles.subtitle}>
            {mode === 'live' ? 'Modalità Live' : 'Modalità Test'}
            {week && ` • Giornata ${week}`}
          </Text>
        </View>

        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>🏆</Text>
          <Text style={styles.placeholderTitle}>Risultati in arrivo</Text>
          <Text style={styles.placeholderText}>
            Qui vedrai i risultati delle partite e le classifiche
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 80,
  },
  header: {
    marginBottom: spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
