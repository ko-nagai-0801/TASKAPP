import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, radius, spacing, typography } from "../design/tokens";

type SosModeScreenProps = {
  onBack: () => void;
  onDone: (payload: {
    hydrationDone: boolean;
    breathingDone: boolean;
    restDone: boolean;
  }) => void;
};

export function SosModeScreen({ onBack, onDone }: SosModeScreenProps) {
  const [hydrationDone, setHydrationDone] = useState(false);
  const [breathingDone, setBreathingDone] = useState(false);
  const [restDone, setRestDone] = useState(false);
  const [showContactNote, setShowContactNote] = useState(false);

  const checkedCount = useMemo(
    () => [hydrationDone, breathingDone, restDone].filter(Boolean).length,
    [hydrationDone, breathingDone, restDone]
  );

  const handleDone = () => {
    onDone({
      hydrationDone,
      breathingDone,
      restDone
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>非常モード</Text>

        <AppCard tone="hero">今日はこれだけで十分です</AppCard>

        <Pressable style={styles.taskCard} onPress={() => setHydrationDone((v) => !v)}>
          <Text style={styles.taskText}>{hydrationDone ? "[x]" : "[ ]"} 水分をひと口</Text>
        </Pressable>

        <Pressable style={styles.taskCard} onPress={() => setBreathingDone((v) => !v)}>
          <Text style={styles.taskText}>{breathingDone ? "[x]" : "[ ]"} 10秒呼吸</Text>
        </Pressable>

        <Pressable style={styles.taskCard} onPress={() => setRestDone((v) => !v)}>
          <Text style={styles.taskText}>{restDone ? "[x]" : "[ ]"} 横になる</Text>
        </Pressable>

        <AppCard>
          <Text style={styles.statusText}>{`完了: ${checkedCount}/3`}</Text>
        </AppCard>

        <AppButton
          label={showContactNote ? "連絡先メモを閉じる" : "連絡先メモを見る（任意）"}
          variant="ghost"
          onPress={() => setShowContactNote((v) => !v)}
        />

        {showContactNote ? (
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>つらい時は主治医または信頼できる人へ連絡</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label="ホームに戻る" onPress={handleDone} />
        </View>
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
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text
  },
  taskCard: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  taskText: {
    fontSize: typography.body,
    color: colors.text
  },
  statusText: {
    fontSize: typography.body,
    color: colors.muted
  },
  contactBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  contactText: {
    fontSize: typography.caption,
    color: colors.muted
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
