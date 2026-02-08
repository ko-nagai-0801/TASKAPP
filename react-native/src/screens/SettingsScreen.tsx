import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, radius, spacing, typography } from "../design/tokens";
import { NotificationSettings } from "../types/settings";

type SettingsScreenProps = {
  initialSettings: NotificationSettings;
  onBack: () => void;
  onSave: (settings: NotificationSettings) => Promise<void>;
  onResetOnboarding: () => void;
};

function normalizeTime(raw: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function SettingsScreen({ initialSettings, onBack, onSave, onResetOnboarding }: SettingsScreenProps) {
  const [reminderEnabled, setReminderEnabled] = useState(initialSettings.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(initialSettings.reminderTime);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError("");

    const parsed = normalizeTime(reminderTime);
    if (!parsed) {
      setError("時刻は HH:mm 形式で入力してください（例: 20:00）");
      return;
    }
    setReminderTime(parsed);

    setIsSaving(true);
    try {
      await onSave({
        reminderEnabled,
        reminderTime: parsed
      });
    } catch {
      setError("設定の保存に失敗しました。再試行してください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>設定</Text>

        <AppCard>
          <View style={styles.row}>
            <View style={styles.textColumn}>
              <Text style={styles.label}>毎日のリマインド通知</Text>
              <Text style={styles.subLabel}>1日1回、やさしい通知を送ります</Text>
            </View>
            <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>通知時刻（HH:mm）</Text>
          <TextInput
            value={reminderTime}
            onChangeText={setReminderTime}
            editable={reminderEnabled}
            placeholder="20:00"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            style={[styles.input, !reminderEnabled && styles.inputDisabled]}
          />
          <Text style={styles.subLabel}>例: 20:00（24時間表記）</Text>
        </AppCard>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label={isSaving ? "保存中..." : "保存"} onPress={() => void handleSave()} />
        </View>

        <AppButton label="オンボーディングを再表示" onPress={onResetOnboarding} variant="ghost" />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  textColumn: {
    flex: 1
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "600"
  },
  subLabel: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption
  },
  input: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: typography.body
  },
  inputDisabled: {
    opacity: 0.5
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
