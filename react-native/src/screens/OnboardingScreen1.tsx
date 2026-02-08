import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, spacing, typography } from "../design/tokens";

type OnboardingScreen1Props = {
  onNext: () => void;
  onSkip: () => void;
};

export function OnboardingScreen1({ onNext, onSkip }: OnboardingScreen1Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Onboarding 1</Text>

        <AppCard tone="hero">
          ここに来てくれただけで、もう一歩進んでいます
        </AppCard>

        <AppCard>
          <Text style={styles.subText}>30秒で記録。オフラインでも使えます</Text>
        </AppCard>

        <View style={styles.actions}>
          <AppButton label="スキップ" onPress={onSkip} variant="ghost" />
          <AppButton label="次へ" onPress={onNext} />
        </View>

        <Text style={styles.progress}>● ○ ○</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    fontSize: typography.subtitle,
    color: colors.muted,
    fontWeight: "700"
  },
  subText: {
    fontSize: typography.body,
    color: colors.muted
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  progress: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: typography.caption
  }
});
