import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle
} from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type Variant = "primary" | "secondary" | "ghost" | "warning" | "danger";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  testID,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        variant === "warning" && styles.warning,
        variant === "danger" && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" && styles.primaryText,
          variant === "secondary" && styles.secondaryText,
          variant === "ghost" && styles.ghostText,
          variant === "warning" && styles.warningText,
          variant === "danger" && styles.dangerText,
          disabled && styles.disabledText,
          textStyle
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  ghost: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning
  },
  danger: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border
  },
  text: {
    fontSize: typography.button,
    fontWeight: "700"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  secondaryText: {
    color: colors.primary
  },
  ghostText: {
    color: colors.text
  },
  warningText: {
    color: colors.warning
  },
  dangerText: {
    color: colors.error
  },
  disabledText: {
    color: colors.muted
  }
});
