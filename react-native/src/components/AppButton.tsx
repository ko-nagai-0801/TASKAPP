import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle
} from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type Variant = "primary" | "ghost";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  style,
  textStyle,
  accessibilityLabel
}: AppButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.ghostText, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md
  },
  primary: {
    backgroundColor: colors.primaryStart,
    borderColor: colors.primaryStart
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  },
  pressed: {
    opacity: 0.85
  },
  text: {
    fontSize: typography.button,
    fontWeight: "700"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  ghostText: {
    color: colors.text
  }
});
