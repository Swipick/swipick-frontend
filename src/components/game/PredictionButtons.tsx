import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { PredictionChoice } from '../../types/game.types';
import { colors } from '../../theme';

interface PredictionButtonsProps {
  onPredict: (choice: PredictionChoice) => void;
  disabled?: boolean;
}

/**
 * Diamond-shaped prediction buttons
 * Layout: 1 (left), X (top), 2 (right), Skip (bottom)
 */
export default function PredictionButtons({
  onPredict,
  disabled = false,
}: PredictionButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Left Button - Home Win (1) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonLeft, disabled && styles.buttonDisabled]}
        onPress={() => onPredict('1')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>1</Text>
        <Text style={styles.buttonLabel}>Casa</Text>
      </TouchableOpacity>

      {/* Top Button - Draw (X) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonTop, disabled && styles.buttonDisabled]}
        onPress={() => onPredict('X')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>X</Text>
        <Text style={styles.buttonLabel}>Pareggio</Text>
      </TouchableOpacity>

      {/* Right Button - Away Win (2) */}
      <TouchableOpacity
        style={[styles.button, styles.buttonRight, disabled && styles.buttonDisabled]}
        onPress={() => onPredict('2')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>2</Text>
        <Text style={styles.buttonLabel}>Trasferta</Text>
      </TouchableOpacity>

      {/* Bottom Button - Skip */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonBottom,
          styles.buttonSkip,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => onPredict('SKIP')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, styles.skipText]}>↓</Text>
        <Text style={[styles.buttonLabel, styles.skipLabel]}>Salta</Text>
      </TouchableOpacity>

      {/* Center Circle - Visual only */}
      <View style={styles.centerCircle} />
    </View>
  );
}

const BUTTON_SIZE = 70;
const CENTER_OFFSET = 45;

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonLabel: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    fontWeight: '600',
  },
  // Positions - Diamond layout
  buttonLeft: {
    left: 0,
    top: '50%',
    marginTop: -(BUTTON_SIZE / 2),
    backgroundColor: colors.home, // Green
  },
  buttonTop: {
    top: 0,
    left: '50%',
    marginLeft: -(BUTTON_SIZE / 2),
    backgroundColor: colors.draw, // Gray
  },
  buttonRight: {
    right: 0,
    top: '50%',
    marginTop: -(BUTTON_SIZE / 2),
    backgroundColor: colors.away, // Red
  },
  buttonBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -(BUTTON_SIZE / 2),
  },
  buttonSkip: {
    backgroundColor: colors.skip, // Yellow
  },
  skipText: {
    fontSize: 28,
    color: '#000',
  },
  skipLabel: {
    color: '#000',
  },
  centerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'absolute',
  },
});
