import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  completed: number;
  total: number;
  height?: number;
}

export default function ProgressBar({
  completed,
  total,
  height = 24,
}: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${Math.min(percentage, 100)}%`,
            minWidth: percentage > 0 ? 60 : 0,
          },
        ]}
      />
      <View style={styles.textOverlay}>
        <Text style={styles.progressText}>
          {completed}/{total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12,
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
