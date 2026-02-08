import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, radius, spacing, typography } from "../design/tokens";

type OnboardingScreen3Props = {
  onBack: () => void;
  onStart: () => void;
};

export function OnboardingScreen3({ onBack, onStart }: OnboardingScreen3Props) {
  const [consented, setConsented] = useState(false);
  const [showError, setShowError] = useState(false);

  const checkboxSymbol = useMemo(() => (consented ? "[x]" : "[ ]"), [consented]);

  const handleStart = () => {
    if (!consented) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onStart();
  };

  const toggleConsent = () => {
    const next = !consented;
    setConsented(next);
    if (next) {
      setShowError(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Onboarding 3</Text>

        <AppCard tone="hero">今日はひとつだけ、記録してみましょう</AppCard>

        <AppCard>
          <Text style={styles.subText}>しんどい日は非常モードだけでも十分です</Text>
        </AppCard>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consented }}
          accessibilityLabel="利用規約とプライバシーポリシーに同意します"
          onPress={toggleConsent}
          testID="onboarding-consent"
          style={({ pressed }) => [styles.checkboxCard, pressed && styles.pressed]}
        >
          <Text style={styles.checkboxText}>
            {checkboxSymbol} 利用規約とプライバシーポリシーに同意します
          </Text>
        </Pressable>

        {showError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>同意のうえ、はじめてください</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label="はじめる" onPress={handleStart} testID="onboarding-start" />
        </View>

        <Text style={styles.progress}>○ ○ ●</Text>
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
  checkboxCard: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  checkboxText: {
    color: colors.text,
    fontSize: typography.body
  },
  pressed: {
    opacity: 0.85
  },
  errorBox: {
    borderWidth: 1,
    borderColor: "#E6B4B4",
    borderRadius: radius.md,
    backgroundColor: "#FFF6F6",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  errorText: {
    color: "#8F2F2F",
    fontSize: typography.caption
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  progress: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: typography.caption
  }
});
