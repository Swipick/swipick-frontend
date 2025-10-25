import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MatchCard as MatchCardType, PredictionChoice } from '../../types/game.types';
import { MatchDetails } from './MatchDetails';
import { TeamInfo } from './TeamInfo';
import { getTeamLogo } from '../../utils/logoMapper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 150;
const VELOCITY_THRESHOLD = 500;

interface MatchCardProps {
  matchCard: MatchCardType;
  onSwipe?: (choice: PredictionChoice) => void;
  enabled?: boolean;
  isPreview?: boolean;
}

export default function MatchCard({
  matchCard,
  onSwipe,
  enabled = true,
  isPreview = false,
}: MatchCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const { home, away, kickoff, stadium } = matchCard;

  // Get local logo assets
  const homeTeamLogo = getTeamLogo(home.logo);
  const awayTeamLogo = getTeamLogo(away.logo);

  const homeTeam = {
    name: home.name,
    logo: homeTeamLogo,
  };

  const awayTeam = {
    name: away.name,
    logo: awayTeamLogo,
  };

  const handleSwipeComplete = (choice: PredictionChoice) => {
    if (onSwipe) {
      onSwipe(choice);
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

          // Animate off screen
          translateX.value = withTiming(
            dx < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
            { duration: 220 },
            () => {
              // Reset position after animation
              translateX.value = 0;
              translateY.value = 0;
            }
          );

          handleSwipeComplete(choice);
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
          // Swipe up - Draw
          translateY.value = withTiming(
            -SCREEN_WIDTH,
            { duration: 220 },
            () => {
              translateX.value = 0;
              translateY.value = 0;
            }
          );
          handleSwipeComplete('X');
        } else if (dy > SWIPE_THRESHOLD || vy > VELOCITY_THRESHOLD) {
          // Swipe down - Skip (with complex animation)
          translateY.value = withTiming(
            SCREEN_WIDTH,
            { duration: 600 },
            () => {
              translateX.value = 0;
              translateY.value = 0;
            }
          );
          handleSwipeComplete('SKIP');
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
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotation}deg` },
      ],
    };
  });

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        animatedCardStyle,
        isPreview && styles.previewCard,
      ]}
    >
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
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    maxWidth: 384,
    width: '100%',
  },
  previewCard: {
    opacity: 0.6,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
});
