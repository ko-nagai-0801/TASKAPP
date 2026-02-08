import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, spacing, typography } from "../design/tokens";

type HomeScreenProps = {
  affirmationText: string;
  insightMessage: string | null;
  moodCountToday: number;
  winCountToday: number;
  sosCountToday: number;
  onMoodPress: () => void;
  onWinPress: () => void;
  onSosPress: () => void;
  onCalendarPress: () => void;
  onPlanPress: () => void;
  onSettingsPress: () => void;
};

export function HomeScreen({
  affirmationText,
  insightMessage,
  moodCountToday,
  winCountToday,
  sosCountToday,
  onMoodPress,
  onWinPress,
  onSosPress,
  onCalendarPress,
  onPlanPress,
  onSettingsPress
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>今日の1分</Text>

        <AppCard tone="hero">{`今日の肯定: 「${affirmationText}」`}</AppCard>

        <AppButton label="気分を記録" onPress={onMoodPress} />
        <AppButton label="できたことを記録" onPress={onWinPress} />
        <AppButton label="非常モード" onPress={onSosPress} variant="ghost" />

        <AppCard>
          <Text style={styles.statusText}>
            {`本日の状態: 気分 ${moodCountToday}件 / できたこと ${winCountToday}件 / SOS ${sosCountToday}件`}
          </Text>
        </AppCard>

        {insightMessage ? (
          <AppCard>
            <Text style={styles.insightTitle}>傾向メモ</Text>
            <Text style={styles.insightText}>{insightMessage}</Text>
          </AppCard>
        ) : null}

        <View style={styles.bottomActions}>
          <AppButton label="積み上げを見る" onPress={onCalendarPress} variant="ghost" />
          <AppButton label="週間プラン" onPress={onPlanPress} variant="ghost" />
          <AppButton label="設定" onPress={onSettingsPress} variant="ghost" />
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
  statusText: {
    fontSize: typography.body,
    color: colors.muted,
    lineHeight: 20
  },
  insightTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "600"
  },
  insightText: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption
  },
  bottomActions: {
    marginTop: spacing.sm,
    gap: spacing.sm
  }
});
