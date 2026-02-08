import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, radius, spacing, typography } from "../design/tokens";

const TAG_OPTIONS = [
  "起きられた",
  "水分をとった",
  "服薬した",
  "外気を吸った",
  "シャワー",
  "食事"
] as const;

type WinEntryScreenProps = {
  onBack: () => void;
  onSave: (payload: { tags: string[]; note: string }) => void;
};

export function WinEntryScreen({ onBack, onSave }: WinEntryScreenProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const noteLength = useMemo(() => note.length, [note]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((v) => v !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const trimmedNote = note.trim();

    if (selectedTags.length === 0 && trimmedNote.length === 0) {
      setError("タグかメモを1つ以上入力してください");
      return;
    }

    if (trimmedNote.length > 100) {
      setError("メモは100文字以内で入力してください");
      return;
    }

    setError("");
    onSave({ tags: selectedTags, note: trimmedNote });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>できたこと記録</Text>

        <AppCard>
          <Text style={styles.label}>クイックタグ（複数選択）</Text>
          <View style={styles.tagsWrap}>
            {TAG_OPTIONS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  accessibilityLabel={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>自由入力（任意 / 最大100文字）</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={100}
            placeholder="例: 小さくても残せた"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.counter}>{noteLength}/100</Text>
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
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  tagChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  tagChipActive: {
    borderColor: colors.primaryStart,
    backgroundColor: colors.primarySoft
  },
  tagText: {
    color: colors.text,
    fontSize: typography.caption
  },
  tagTextActive: {
    color: colors.primaryStart,
    fontWeight: "700"
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
