import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
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
        <AppCard>
          <Text style={styles.label}>気分レベル（必須）</Text>
          <View style={styles.levelRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <Pressable
                key={level}
                accessibilityRole="button"
                accessibilityLabel={`気分レベル ${level}`}
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
              onPress={() => setPolarity(polarity === "low" ? null : "low")}
              style={[styles.polarityChip, polarity === "low" && styles.polarityChipActive]}
            >
              <Text style={styles.polarityText}>低め</Text>
            </Pressable>
            <Pressable
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
          />
          <Text style={styles.counter}>{note.length}/80</Text>
        </AppCard>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.text
  },
  label: {
    fontSize: typography.body,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  levelRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  levelChip: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  levelChipActive: {
    borderColor: colors.primaryStart,
    backgroundColor: colors.primarySoft
  },
  levelChipText: {
    color: colors.text,
    fontWeight: "600"
  },
  levelChipTextActive: {
    color: colors.primaryStart
  },
  polarityRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  polarityChip: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  polarityChipActive: {
    borderColor: colors.primaryStart,
    backgroundColor: colors.primarySoft
  },
  polarityText: {
    color: colors.text,
    fontSize: typography.body
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    textAlignVertical: "top",
    color: colors.text
  },
  counter: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.muted,
    textAlign: "right"
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
    gap: spacing.sm
  }
});
