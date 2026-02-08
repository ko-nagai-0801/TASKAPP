import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type ToastTone = "success" | "error" | "info";

type AppToastProps = {
  visible: boolean;
  tone: ToastTone;
  message: string;
};

export function AppToast({ visible, tone, message }: AppToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -10,
        duration: 180,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        tone === "success" && styles.success,
        tone === "error" && styles.error,
        tone === "info" && styles.info,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
      accessibilityLiveRegion="polite"
      accessible
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: "absolute",
    top: 12,
    left: spacing.lg,
    right: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 99
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft
  },
  info: {
    borderColor: colors.info,
    backgroundColor: colors.infoSoft
  },
  text: {
    color: colors.text,
    fontSize: typography.label,
    fontWeight: "600",
    textAlign: "center"
  }
});
