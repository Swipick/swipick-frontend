import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useDerivedValue,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { MatchCard as MatchCardType, PredictionChoice } from '../../types/game.types';
import { MatchDetails } from './MatchDetails';
import { TeamInfo } from './TeamInfo';
import { getTeamLogo } from '../../utils/logoMapper';

const { width: SCREEN_WIDTH, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 150;
const VELOCITY_THRESHOLD = 500;
const isSmallScreen = screenHeight < 750;

interface MatchCardProps {
  matchCard: MatchCardType;
  onSwipe?: (choice: PredictionChoice) => void;
  enabled?: boolean;
  isPreview?: boolean;
  shouldShake?: boolean;
  onShakeComplete?: () => void;
}

export default function MatchCard({
  matchCard,
  onSwipe,
  enabled = true,
  isPreview = false,
  shouldShake = false,
  onShakeComplete,
}: MatchCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const shakeX = useSharedValue(0);

  // Trigger shake animation when shouldShake prop changes
  useEffect(() => {
    if (shouldShake) {
      // Shake animation: rapid left-right movement
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withRepeat(
          withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 })
          ),
          3, // Repeat 3 times
          false
        ),
        withTiming(0, { duration: 50 }, () => {
          // Call onShakeComplete when animation finishes
          if (onShakeComplete) {
            runOnJS(onShakeComplete)();
          }
        })
      );
    }
  }, [shouldShake]);

  const { home, away, kickoff, stadium } = matchCard;

  // Get local logo assets - pass team name as fallback
  const homeTeamLogo = getTeamLogo(home.logo, home.name);
  const awayTeamLogo = getTeamLogo(away.logo, away.name);

  const homeTeam = {
    name: home.name,
    logo: homeTeamLogo,
  };

  const awayTeam = {
    name: away.name,
    logo: awayTeamLogo,
  };

  const triggerHaptic = async (choice: PredictionChoice) => {
    // Medium haptic for predictions (1, X, 2), Light for skip
    if (choice === 'SKIP') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleSwipeComplete = (choice: PredictionChoice) => {
    console.log('[MatchCard] Swipe completed with choice:', choice);
    console.log('[MatchCard] onSwipe callback exists:', !!onSwipe);

    // Trigger haptic feedback
    triggerHaptic(choice);

    if (onSwipe) {
      onSwipe(choice);
      console.log('[MatchCard] onSwipe callback called');
    } else {
      console.log('[MatchCard] WARNING: No onSwipe callback provided!');
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (!enabled) return;
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd((event) => {
      if (!enabled) {
        translateX.value = withSpring(0, {
          stiffness: 300,
          damping: 30,
        });
        translateY.value = withSpring(0, {
          stiffness: 300,
          damping: 30,
        });
        return;
      }

      const dx = translateX.value;
      const dy = translateY.value;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      const vx = Math.abs(event.velocityX);
      const vy = event.velocityY;

      // Determine swipe direction
      if (ax >= ay) {
        // Horizontal swipe dominates
        if (ax > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
          const choice: PredictionChoice = dx < 0 ? '1' : '2';

          // Animate off screen - no position reset needed as component will unmount
          translateX.value = withTiming(
            dx < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
            { duration: 220 }
          );

          runOnJS(handleSwipeComplete)(choice);
        } else {
          // Snap back
          translateX.value = withSpring(0, {
            stiffness: 300,
            damping: 30,
          });
          translateY.value = withSpring(0, {
            stiffness: 300,
            damping: 30,
          });
        }
      } else {
        // Vertical swipe dominates
        if (dy < -SWIPE_THRESHOLD || vy < -VELOCITY_THRESHOLD) {
          // Swipe up - Draw - no position reset needed as component will unmount
          translateY.value = withTiming(-SCREEN_WIDTH, { duration: 220 });
          runOnJS(handleSwipeComplete)('X');
        } else if (dy > SWIPE_THRESHOLD || vy > VELOCITY_THRESHOLD) {
          // Swipe down - Skip - no position reset needed as component will unmount
          translateY.value = withTiming(SCREEN_WIDTH, { duration: 600 });
          runOnJS(handleSwipeComplete)('SKIP');
        } else {
          // Snap back
          translateX.value = withSpring(0, {
            stiffness: 300,
            damping: 30,
          });
          translateY.value = withSpring(0, {
            stiffness: 300,
            damping: 30,
          });
        }
      }
    })
    .enabled(enabled && !isPreview);

  const animatedCardStyle = useAnimatedStyle(() => {
    // Rotation based on horizontal movement
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10]
    );

    return {
      transform: [
        { translateX: translateX.value + shakeX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotation}deg` },
      ],
    };
  });

  // Individual opacity styles for each choice label
  const choice1OpacityStyle = useAnimatedStyle(() => {
    if (translateX.value < -20 && Math.abs(translateX.value) > Math.abs(translateY.value)) {
      const dx = Math.abs(translateX.value);
      const dragThreshold = SWIPE_THRESHOLD * 0.3;
      const maxThreshold = SWIPE_THRESHOLD * 0.95;
      const opacity = interpolate(dx, [0, dragThreshold, maxThreshold, SCREEN_WIDTH], [0, 1, 1, 0.3]);
      return { opacity: Math.max(0, Math.min(1, opacity)) };
    }
    return { opacity: 0 };
  });

  const choiceXOpacityStyle = useAnimatedStyle(() => {
    if (translateY.value < -20 && Math.abs(translateY.value) > Math.abs(translateX.value)) {
      const dy = Math.abs(translateY.value);
      const dragThreshold = SWIPE_THRESHOLD * 0.3;
      const maxThreshold = SWIPE_THRESHOLD * 0.95;
      const opacity = interpolate(dy, [0, dragThreshold, maxThreshold, SCREEN_WIDTH], [0, 1, 1, 0.3]);
      return { opacity: Math.max(0, Math.min(1, opacity)) };
    }
    return { opacity: 0 };
  });

  const choice2OpacityStyle = useAnimatedStyle(() => {
    if (translateX.value > 20 && Math.abs(translateX.value) > Math.abs(translateY.value)) {
      const dx = Math.abs(translateX.value);
      const dragThreshold = SWIPE_THRESHOLD * 0.3;
      const maxThreshold = SWIPE_THRESHOLD * 0.95;
      const opacity = interpolate(dx, [0, dragThreshold, maxThreshold, SCREEN_WIDTH], [0, 1, 1, 0.3]);
      return { opacity: Math.max(0, Math.min(1, opacity)) };
    }
    return { opacity: 0 };
  });

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        animatedCardStyle,
        isPreview && styles.previewCard,
      ]}
    >
      {/* Prediction Choice Overlays */}
      {!isPreview && enabled && (
        <>
          <Animated.View style={[styles.choiceOverlay, choice1OpacityStyle]} pointerEvents="none">
            <Text style={styles.choiceText}>1</Text>
          </Animated.View>
          <Animated.View style={[styles.choiceOverlay, choiceXOpacityStyle]} pointerEvents="none">
            <Text style={styles.choiceText}>X</Text>
          </Animated.View>
          <Animated.View style={[styles.choiceOverlay, choice2OpacityStyle]} pointerEvents="none">
            <Text style={styles.choiceText}>2</Text>
          </Animated.View>
        </>
      )}

      {/* Match Details */}
      <MatchDetails kickoff={kickoff} stadium={stadium} />

      {/* Teams Container */}
      <View style={styles.teamsContainer}>
        <TeamInfo
          team={homeTeam}
          standingsPosition={home.standingsPosition}
          winRate={home.winRateHome}
          winRateLabel="Vittorie in casa"
          last5={home.last5 || []}
          isHomeTeam={true}
        />

        <TeamInfo
          team={awayTeam}
          standingsPosition={away.standingsPosition}
          winRate={away.winRateAway}
          winRateLabel="Vittorie in trasferta"
          last5={away.last5 || []}
          isHomeTeam={false}
        />
      </View>
    </Animated.View>
  );

  // If it's a preview card or gestures are disabled, just return the card without gesture handler
  if (isPreview || !enabled) {
    return CardContent;
  }

  return (
    <GestureDetector gesture={panGesture}>
      {CardContent}
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: isSmallScreen ? 10 : 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    width: '100%',
    position: 'relative',
  },
  previewCard: {
    opacity: 0.6,
  },
  choiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: 10,
  },
  choiceText: {
    fontSize: 180,
    fontWeight: 'bold',
    color: '#7a57f6',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 12 : 24,
  },
});
