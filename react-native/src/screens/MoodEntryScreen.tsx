import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { StateBanner } from "../components/StateBanner";
import { colors, radius, spacing, typography } from "../design/tokens";

type Polarity = "low" | "high" | null;

type MoodEntryScreenProps = {
  onBack: () => void;
  onSave: (payload: { moodLevel: number; polarity: Polarity; note: string }) => void;
};

export function MoodEntryScreen({ onBack, onSave }: MoodEntryScreenProps) {
  const [moodLevel, setMoodLevel] = useState<number | null>(null);
  const [polarity, setPolarity] = useState<Polarity>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (moodLevel === null) {
      setError("気分を選んでください");
      return;
    }
    if (note.length > 80) {
      setError("メモは80文字以内で入力してください");
      return;
    }
    setError("");
    onSave({ moodLevel, polarity, note: note.trim() });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>気分チェック</Text>
        <StateBanner tone="info" title="入力の目安" message="気分レベルを選ぶだけで保存できます。メモは任意です。" />

        <AppCard>
          <Text style={styles.label}>気分レベル（必須）</Text>
          <View style={styles.levelRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                accessibilityRole="button"
                accessibilityLabel={`気分レベル ${level}`}
                accessibilityHint="気分の段階を選択します"
                onPress={() => setMoodLevel(level)}
                style={[styles.levelChip, moodLevel === level && styles.levelChipActive]}
              >
                <Text style={[styles.levelChipText, moodLevel === level && styles.levelChipTextActive]}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>補助トグル（任意）</Text>
          <View style={styles.polarityRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="低めを選択"
              onPress={() => setPolarity(polarity === "low" ? null : "low")}
              style={[styles.polarityChip, polarity === "low" && styles.polarityChipActive]}
            >
              <Text style={styles.polarityText}>低め</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="高めを選択"
              onPress={() => setPolarity(polarity === "high" ? null : "high")}
              style={[styles.polarityChip, polarity === "high" && styles.polarityChipActive]}
            >
              <Text style={styles.polarityText}>高め</Text>
            </Pressable>
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>ひとことメモ（任意 / 最大80文字）</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={80}
            placeholder="例: 少し落ち着いた"
            placeholderTextColor={colors.muted}
            style={styles.input}
            accessibilityLabel="ひとことメモ入力"
          />
          <Text style={styles.counter}>{note.length}/80</Text>
        </AppCard>

        {error ? <StateBanner tone="error" title="入力エラー" message={error} /> : null}

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label="保存" onPress={handleSave} />
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
    fontSize: typography.heading,
    fontWeight: "700",
    color: colors.text
  },
  label: {
    fontSize: typography.label,
    color: colors.textSubtle,
    marginBottom: spacing.sm
  },
  levelRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  levelChip: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  levelChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  levelChipText: {
    color: colors.text,
    fontWeight: "600"
  },
  levelChipTextActive: {
    color: colors.primary
  },
  polarityRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  polarityChip: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  polarityChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  polarityText: {
    color: colors.text,
    fontSize: typography.body
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    textAlignVertical: "top",
    color: colors.text
  },
  counter: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSubtle,
    textAlign: "right"
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
