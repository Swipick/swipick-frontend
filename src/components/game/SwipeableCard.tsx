import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { PredictionChoice } from '../../types/game.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipe: (choice: PredictionChoice) => void;
  enabled?: boolean;
  index?: number;
}

/**
 * Swipeable Card Component
 * Mapping:
 * - LEFT swipe → '1' (Home Win)
 * - RIGHT swipe → '2' (Away Win)
 * - UP swipe → 'X' (Draw)
 * - DOWN swipe → 'SKIP'
 */
/**
 * SwipeableCard Component (Simplified for Expo Go)
 *
 * Note: Swipe gestures are temporarily disabled due to Expo Go limitations.
 * Use the prediction buttons below the card to make predictions.
 *
 * For swipe functionality, create a development build:
 * npx expo prebuild && npx expo run:ios
 */
export default function SwipeableCard({
  children,
  onSwipe,
  enabled = true,
  index = 0,
}: SwipeableCardProps) {
  // Simplified version without gestures for Expo Go compatibility
  return (
    <View style={styles.container}>
      <View style={[styles.card, { zIndex: 30 - index }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 384,
    minHeight: 400,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
});
