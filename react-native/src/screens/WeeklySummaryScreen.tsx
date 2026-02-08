import React, { useMemo } from "react";
import { Alert, SafeAreaView, Share, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, spacing, typography } from "../design/tokens";
import { WeeklyGoal } from "../types/goals";
import { MoodLog, SosLog, toDateKey, WinLog } from "../types/logs";

type WeeklySummaryScreenProps = {
  weekStart: string;
  goals: WeeklyGoal[];
  moodLogs: MoodLog[];
  winLogs: WinLog[];
  sosLogs: SosLog[];
  onBack: () => void;
};

function summarizeTrend(moodLogs: MoodLog[]): string {
  const lowCount = moodLogs.filter((log) => log.polarity === "low").length;
  const highCount = moodLogs.filter((log) => log.polarity === "high").length;
  if (lowCount === 0 && highCount === 0) {
    return "気分の偏りは大きくありません。";
  }
  if (lowCount > highCount) {
    return "低めの記録がやや多めです。負荷を下げる行動を優先しましょう。";
  }
  if (highCount > lowCount) {
    return "高めの記録がやや多めです。休息とペース調整を意識しましょう。";
  }
  return "低め・高めが同程度です。波を観察しつつ無理を避けましょう。";
}

function detectLowStreak(moodLogs: MoodLog[]): number {
  const sorted = [...moodLogs].sort((a, b) => a.date.localeCompare(b.date));
  let streak = 0;
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    if (sorted[index].polarity === "low") {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function inRecentDays(dateKey: string, days: number): boolean {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let index = 0; index < days; index += 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - index);
    if (toDateKey(date) === dateKey) {
      return true;
    }
  }
  return false;
}

export function WeeklySummaryScreen({
  weekStart,
  goals,
  moodLogs,
  winLogs,
  sosLogs,
  onBack
}: WeeklySummaryScreenProps) {
  const recentMoodLogs = useMemo(() => moodLogs.filter((log) => inRecentDays(log.date, 7)), [moodLogs]);
  const recentWinLogs = useMemo(() => winLogs.filter((log) => inRecentDays(log.date, 7)), [winLogs]);
  const recentSosLogs = useMemo(() => sosLogs.filter((log) => inRecentDays(log.date, 7)), [sosLogs]);

  const goalsDone = goals.filter((goal) => goal.completed).length;
  const averageMood =
    recentMoodLogs.length > 0
      ? (recentMoodLogs.reduce((acc, log) => acc + log.moodLevel, 0) / recentMoodLogs.length).toFixed(1)
      : "-";
  const lowStreak = detectLowStreak(recentMoodLogs);
  const trendText = summarizeTrend(recentMoodLogs);

  const summaryText = useMemo(() => {
    const lines = [
      "【ちいさな肯定 週次サマリー】",
      `週開始日: ${weekStart}`,
      `気分記録: ${recentMoodLogs.length}件（平均 ${averageMood}）`,
      `できたこと記録: ${recentWinLogs.length}件`,
      `非常モード実行: ${recentSosLogs.length}件`,
      `週間目標達成: ${goalsDone}/${goals.length}`,
      `傾向: ${trendText}`
    ];
    if (lowStreak >= 2) {
      lines.push(`注意: 低めの連続記録が ${lowStreak} 件あります`);
    }
    return lines.join("\n");
  }, [averageMood, goals.length, goalsDone, lowStreak, recentMoodLogs.length, recentSosLogs.length, recentWinLogs.length, trendText, weekStart]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: summaryText
      });
    } catch {
      Alert.alert("共有エラー", "サマリー共有に失敗しました。");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>週次サマリー</Text>

        <AppCard>
          <Text style={styles.title}>インサイト</Text>
          <Text style={styles.body}>{trendText}</Text>
          {lowStreak >= 2 ? <Text style={styles.warning}>{`低めの連続記録: ${lowStreak}件`}</Text> : null}
        </AppCard>

        <AppCard>
          <Text style={styles.title}>受診/共有用サマリー</Text>
          <Text style={styles.preformatted}>{summaryText}</Text>
        </AppCard>

        <View style={styles.actions}>
          <AppButton label="戻る" variant="ghost" onPress={onBack} />
          <AppButton label="共有する" onPress={() => void handleShare()} />
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
    color: colors.text,
    fontWeight: "700"
  },
  title: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600"
  },
  body: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.body
  },
  preformatted: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: typography.caption,
    lineHeight: 18
  },
  warning: {
    marginTop: spacing.sm,
    color: "#8F2F2F",
    fontSize: typography.caption
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
