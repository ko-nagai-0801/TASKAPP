import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, spacing, typography } from "../design/tokens";

type OnboardingScreen2Props = {
  onBack: () => void;
  onNext: () => void;
};

export function OnboardingScreen2({ onBack, onNext }: OnboardingScreen2Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Onboarding 2</Text>

        <AppCard tone="hero">
          できたことは、どんなに小さくても“できたこと”です
        </AppCard>

        <AppCard>
          <Text style={styles.subText}>比較はしません。あなたのペースを大切にします</Text>
        </AppCard>

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label="次へ" onPress={onNext} />
        </View>

        <Text style={styles.progress}>○ ● ○</Text>
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
