import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  tone?: "default" | "hero" | "success" | "warning" | "error" | "info";
};

export function AppCard({ children, style, textStyle, tone = "default" }: AppCardProps) {
  return (
    <View
      style={[
        styles.base,
        tone === "default" && styles.default,
        tone === "hero" && styles.hero,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "error" && styles.error,
        tone === "info" && styles.info,
        style
      ]}
    >
      {typeof children === "string" ? <Text style={[styles.text, textStyle]}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md
  },
  default: {
    backgroundColor: colors.surface
  },
  hero: {
    backgroundColor: colors.primarySoft
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning
  },
  error: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error
  },
  info: {
    backgroundColor: colors.infoSoft,
    borderColor: colors.info
  },
  text: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 20
  }
});
