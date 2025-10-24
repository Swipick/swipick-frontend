import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../../theme';

interface GameHeaderProps {
  currentWeek: number;
  totalFixtures: number;
  completedPredictions: number;
  mode: 'live' | 'test';
  onReset: () => void;
  loading?: boolean;
}

export default function GameHeader({
  currentWeek,
  totalFixtures,
  completedPredictions,
  mode,
  onReset,
  loading = false,
}: GameHeaderProps) {
  const percentage =
    totalFixtures > 0 ? (completedPredictions / totalFixtures) * 100 : 0;

  const handleReset = () => {
    Alert.alert(
      'Ricomincia',
      'Vuoi eliminare tutte le previsioni e ricominciare?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Ricomincia',
          style: 'destructive',
          onPress: onReset,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Mode Badge */}
      {mode === 'test' && (
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>TEST MODE</Text>
        </View>
      )}

      {/* Week Info */}
      <View style={styles.weekInfo}>
        <Text style={styles.weekText}>Settimana {currentWeek}</Text>
        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          style={styles.resetButton}
        >
          <Text style={styles.resetText}>Ricomincia</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]}>
            <Text style={styles.progressText}>
              {completedPredictions}/{totalFixtures}
            </Text>
          </View>
        </View>
      </View>

      {/* Counter */}
      <Text style={styles.counterText}>
        {completedPredictions} di {totalFixtures} previsioni
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60, // Account for status bar
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modeBadge: {
    alignSelf: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  modeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  weekInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weekText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  progressText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  counterText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
