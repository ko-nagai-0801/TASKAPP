import React, { useEffect, useMemo, useRef } from "react";
import { Animated, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { StateBanner } from "../components/StateBanner";
import { colors, spacing, typography } from "../design/tokens";

type HomeScreenProps = {
  affirmationText: string;
  insightMessage: string | null;
  moodCountToday: number;
  winCountToday: number;
  sosCountToday: number;
  isGentleMode: boolean;
  onToggleGentleMode: () => void;
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
  isGentleMode,
  onToggleGentleMode,
  onMoodPress,
  onWinPress,
  onSosPress,
  onCalendarPress,
  onPlanPress,
  onSettingsPress
}: HomeScreenProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.02,
        duration: 140,
        useNativeDriver: true
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true
      })
    ]).start();
  }, [affirmationText, pulse]);

  const totalRecords = moodCountToday + winCountToday + sosCountToday;
  const isEmptyToday = totalRecords === 0;
  const primaryLabel = useMemo(() => {
    if (isGentleMode) {
      return "非常モードを開く";
    }
    if (moodCountToday === 0) {
      return "今日の記録をはじめる";
    }
    return "できたことを追加する";
  }, [isGentleMode, moodCountToday]);

  const onPrimaryPress = useMemo(() => {
    if (isGentleMode) {
      return onSosPress;
    }
    if (moodCountToday === 0) {
      return onMoodPress;
    }
    return onWinPress;
  }, [isGentleMode, moodCountToday, onMoodPress, onSosPress, onWinPress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>今日の1分</Text>
        <Text style={styles.lead}>迷わず始められるよう、最初の操作を1つに絞っています</Text>

        <AppCard tone={isGentleMode ? "warning" : "info"}>
          <Text style={styles.modeTitle}>{isGentleMode ? "しんどい日モード: ON" : "しんどい日モード: OFF"}</Text>
          <Text style={styles.modeBody}>
            {isGentleMode
              ? "表示を簡易化しています。必要最小限の操作だけを表示します。"
              : "通常表示です。必要ならワンタップで簡易表示へ切り替えできます。"}
          </Text>
          <View style={styles.modeAction}>
            <AppButton
              label={isGentleMode ? "通常表示に戻す" : "しんどい日モードに切替"}
              variant={isGentleMode ? "warning" : "secondary"}
              onPress={onToggleGentleMode}
              accessibilityHint="ホーム画面の表示密度を切り替えます"
            />
          </View>
        </AppCard>

        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <AppCard tone="hero">{`今日の肯定: 「${affirmationText}」`}</AppCard>
        </Animated.View>

        <AppButton
          label={primaryLabel}
          onPress={onPrimaryPress}
          variant={isGentleMode ? "warning" : "primary"}
          accessibilityHint="今日の最初の行動を開始します"
        />

        {!isGentleMode ? (
          <View style={styles.secondaryActions}>
            <AppButton label="気分を記録" onPress={onMoodPress} variant="secondary" />
            <AppButton label="できたことを記録" onPress={onWinPress} variant="secondary" />
            <AppButton label="非常モード" onPress={onSosPress} variant="warning" />
          </View>
        ) : (
          <StateBanner tone="info" title="簡易表示中" message="必要なときは下の「設定」から通常表示へも切り替えられます。" />
        )}

        <AppCard>
          <Text style={styles.statusTitle}>本日の記録</Text>
          <Text style={styles.statusText}>{`気分 ${moodCountToday}件 / できたこと ${winCountToday}件 / SOS ${sosCountToday}件`}</Text>
        </AppCard>

        {isEmptyToday ? (
          <StateBanner tone="empty" title="今日の記録はまだありません" message="体調が重い日は1つだけ選べば十分です。" />
        ) : null}

        {insightMessage ? (
          <StateBanner tone="info" title="傾向メモ" message={insightMessage} />
        ) : (
          <StateBanner tone="success" title="継続できています" message="小さな記録の積み重ねが、波の把握につながります。" />
        )}

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
    fontSize: typography.display,
    fontWeight: "800",
    color: colors.text
  },
  lead: {
    fontSize: typography.label,
    color: colors.textSubtle
  },
  modeTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  modeBody: {
    marginTop: spacing.xs,
    color: colors.textSubtle,
    fontSize: typography.caption
  },
  modeAction: {
    marginTop: spacing.sm
  },
  secondaryActions: {
    gap: spacing.sm
  },
  statusTitle: {
    fontSize: typography.label,
    color: colors.text,
    fontWeight: "700"
  },
  statusText: {
    marginTop: spacing.xs,
    fontSize: typography.body,
    color: colors.textSubtle,
    lineHeight: 20
  },
  bottomActions: {
    marginTop: spacing.sm,
    gap: spacing.sm
  }
});
