import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type StateTone = "empty" | "success" | "warning" | "error" | "info";

type StateBannerProps = {
  tone: StateTone;
  title: string;
  message: string;
};

export function StateBanner({ tone, title, message }: StateBannerProps) {
  const isEmpty = tone === "empty";
  return (
    <View
      style={[
        styles.base,
        isEmpty && styles.empty,
        tone === "success" && styles.success,
        tone === "warning" && styles.warning,
        tone === "error" && styles.error,
        tone === "info" && styles.info
      ]}
      accessibilityRole="summary"
      accessible
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs
  },
  empty: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft
  },
  warning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft
  },
  info: {
    borderColor: colors.info,
    backgroundColor: colors.infoSoft
  },
  title: {
    fontSize: typography.label,
    color: colors.text,
    fontWeight: "700"
  },
  message: {
    fontSize: typography.caption,
    color: colors.textSubtle
  }
});
