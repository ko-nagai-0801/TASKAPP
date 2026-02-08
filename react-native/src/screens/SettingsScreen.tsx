import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { StateBanner } from "../components/StateBanner";
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

function dateFromTime(time: string): Date {
  const parsed = normalizeTime(time) ?? "20:00";
  const [hour, minute] = parsed.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function SettingsScreen({ initialSettings, onBack, onSave, onResetOnboarding }: SettingsScreenProps) {
  const [reminderEnabled, setReminderEnabled] = useState(initialSettings.reminderEnabled);
  const [gentleMode, setGentleMode] = useState(initialSettings.gentleMode);
  const [reminderTime, setReminderTime] = useState(initialSettings.reminderTime);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const pickerDate = useMemo(() => dateFromTime(reminderTime), [reminderTime]);

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }
    if (event.type === "dismissed" || !selectedDate) {
      return;
    }
    setReminderTime(formatTime(selectedDate));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

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
        reminderTime: parsed,
        gentleMode
      });
      setSuccess("設定を保存しました");
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
        <Text style={styles.lead}>通知と表示モードを調整できます</Text>

        <AppCard tone="info">
          <View style={styles.row}>
            <View style={styles.textColumn}>
              <Text style={styles.label}>毎日のリマインド通知</Text>
              <Text style={styles.subLabel}>1日1回、やさしい通知を送ります</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              accessibilityLabel="毎日のリマインド通知"
              accessibilityHint="通知機能のオンオフを切り替えます"
            />
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>通知時刻</Text>
          {Platform.OS === "web" ? (
            <TextInput
              value={reminderTime}
              onChangeText={setReminderTime}
              editable={reminderEnabled}
              placeholder="20:00"
              placeholderTextColor={colors.muted}
              keyboardType="numbers-and-punctuation"
              style={[styles.input, !reminderEnabled && styles.inputDisabled]}
              accessibilityLabel="通知時刻入力"
              accessibilityHint="通知を送る時刻を24時間形式で入力します"
            />
          ) : (
            <View style={styles.timePickerWrap}>
              <AppButton
                label={`時刻を選ぶ（${reminderTime}）`}
                variant="secondary"
                onPress={() => setShowPicker((prev) => !prev)}
                disabled={!reminderEnabled}
                accessibilityLabel="通知時刻を選択"
              />
              {showPicker ? (
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handlePickerChange}
                />
              ) : null}
            </View>
          )}
          <Text style={styles.subLabel}>24時間表記（例: 20:00）</Text>
        </AppCard>

        <AppCard tone="warning">
          <View style={styles.row}>
            <View style={styles.textColumn}>
              <Text style={styles.label}>しんどい日モード</Text>
              <Text style={styles.subLabel}>ホームを簡易表示にして操作負荷を下げます</Text>
            </View>
            <Switch
              value={gentleMode}
              onValueChange={setGentleMode}
              accessibilityLabel="しんどい日モード"
              accessibilityHint="ホーム画面を簡易表示に切り替えます"
            />
          </View>
        </AppCard>

        {error ? <StateBanner tone="error" title="保存エラー" message={error} /> : null}
        {success ? <StateBanner tone="success" title="保存完了" message={success} /> : null}

        <View style={styles.actions}>
          <AppButton label="戻る" onPress={onBack} variant="ghost" />
          <AppButton label={isSaving ? "保存中..." : "保存"} onPress={() => void handleSave()} disabled={isSaving} />
        </View>

        <AppButton
          label="オンボーディングを再表示"
          onPress={onResetOnboarding}
          variant="secondary"
          accessibilityHint="初回説明を最初から表示します"
        />
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
  lead: {
    fontSize: typography.label,
    color: colors.textSubtle
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
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  subLabel: {
    marginTop: spacing.xs,
    color: colors.textSubtle,
    fontSize: typography.caption
  },
  input: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: typography.body
  },
  inputDisabled: {
    opacity: 0.5
  },
  timePickerWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
