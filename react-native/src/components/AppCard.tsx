import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../design/tokens";

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  tone?: "default" | "hero";
};

export function AppCard({ children, style, textStyle, tone = "default" }: AppCardProps) {
  const isHero = tone === "hero";
  return (
    <View style={[styles.base, isHero ? styles.hero : styles.default, style]}>
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
  text: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 20
  }
});
