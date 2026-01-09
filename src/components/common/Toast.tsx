import React, { useEffect } from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
}

export default function Toast({
  message,
  visible,
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible) {
      console.log("[Toast] Showing toast with message:", message);
      // Show toast
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });

      // Hide toast after duration
      opacity.value = withDelay(
        duration,
        withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onHide) {
            console.log("[Toast] Hiding toast");
            runOnJS(onHide)();
          }
        })
      );
      translateY.value = withDelay(duration, withTiming(20, { duration: 300 }));
    }
  }, [visible, message]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      pointerEvents="box-none"
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 300,
    left: 16,
    right: 16,
    backgroundColor: "#DC2626", // Bright red for testing
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: "#FFFFFF", // White border for visibility
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 999,
    zIndex: 99999,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
  },
});
