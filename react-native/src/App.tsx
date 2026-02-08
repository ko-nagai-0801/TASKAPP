import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { AppToast } from "./components/AppToast";
import { ScreenTransition } from "./components/ScreenTransition";
import { colors, spacing, typography } from "./design/tokens";
import { syncDailyReminder } from "./notifications/reminder";
import { OnboardingFlow } from "./onboarding";
import { CalendarScreen } from "./screens/CalendarScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MoodEntryScreen } from "./screens/MoodEntryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SosModeScreen } from "./screens/SosModeScreen";
import { WeeklyPlanScreen } from "./screens/WeeklyPlanScreen";
import { WeeklySummaryScreen } from "./screens/WeeklySummaryScreen";
import { WinEntryScreen } from "./screens/WinEntryScreen";
import {
  initDatabase,
  insertMoodLog,
  insertSosLog,
  insertWeeklyGoal,
  insertWinLog,
  loadMoodLogs,
  loadNotificationSettings,
  loadOnboardingCompleted,
  loadSosLogs,
  loadWeeklyGoals,
  loadWinLogs,
  saveNotificationSettings,
  saveOnboardingCompleted,
  updateWeeklyGoalCompletion
} from "./storage/sqlite";
import { getWeekStartKey, WeeklyGoal } from "./types/goals";
import { MoodLog, nowIsoString, SosLog, toDateKey, WinLog } from "./types/logs";
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings } from "./types/settings";

type Screen = "home" | "mood" | "win" | "sos" | "calendar" | "settings" | "plan" | "summary";
type ToastTone = "success" | "error" | "info";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function deriveAffirmation(todayKey: string, moodLogs: MoodLog[], winLogs: WinLog[], sosLogs: SosLog[]): string {
  const hasWinToday = winLogs.some((log) => log.date === todayKey);
  if (hasWinToday) {
    return "小さな行動を積み上げられています";
  }

  const hasMoodToday = moodLogs.some((log) => log.date === todayKey);
  if (hasMoodToday) {
    return "記録したこと自体が前進です";
  }

  const hasSosToday = sosLogs.some((log) => log.date === todayKey);
  if (hasSosToday) {
    return "しんどい中でケアを選べています";
  }

  return "ここに来ただけで十分です";
}

function deriveInsightMessage(moodLogs: MoodLog[], winLogs: WinLog[], sosLogs: SosLog[]): string | null {
  const recentMood = moodLogs.filter((log) => inRecentDays(log.date, 7));
  const recentWin = winLogs.filter((log) => inRecentDays(log.date, 7));
  const recentSos = sosLogs.filter((log) => inRecentDays(log.date, 7));
  const lowStreak = detectLowStreak(recentMood);

  if (lowStreak >= 2) {
    return `低めの記録が ${lowStreak} 件続いています。今日は負荷を下げる行動を優先しましょう。`;
  }

  if (recentSos.length >= 2) {
    return "しんどい時にSOSモードを使えていて、セルフケア行動が維持できています。";
  }

  if (recentWin.length >= 4) {
    return "できたこと記録が増えています。小さな継続がしっかり積み上がっています。";
  }

  const hasRecentRecord = recentMood.length > 0 || recentWin.length > 0 || recentSos.length > 0;
  if (!hasRecentRecord) {
    return "記録が空いていても大丈夫です。再開できた時点で十分に前進です。";
  }

  return null;
}

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [winLogs, setWinLogs] = useState<WinLog[]>([]);
  const [sosLogs, setSosLogs] = useState<SosLog[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [toast, setToast] = useState<{ tone: ToastTone; message: string; visible: boolean } | null>(null);
  const weekStart = useMemo(() => getWeekStartKey(new Date()), []);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (tone: ToastTone, message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ tone, message, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((previous) => (previous ? { ...previous, visible: false } : null));
    }, 2200);
  };

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      try {
        await initDatabase();
        const [
          savedOnboardingCompleted,
          savedMoodLogs,
          savedWinLogs,
          savedSosLogs,
          savedWeeklyGoals,
          savedNotificationSettings
        ] = await Promise.all([
          loadOnboardingCompleted(),
          loadMoodLogs(),
          loadWinLogs(),
          loadSosLogs(),
          loadWeeklyGoals(weekStart),
          loadNotificationSettings()
        ]);

        if (!alive) {
          return;
        }

        setOnboardingCompleted(savedOnboardingCompleted);
        setMoodLogs(savedMoodLogs);
        setWinLogs(savedWinLogs);
        setSosLogs(savedSosLogs);
        setWeeklyGoals(savedWeeklyGoals);
        setNotificationSettings(savedNotificationSettings);
        void syncDailyReminder(savedNotificationSettings, false).catch(() => {
          // Ignore sync failures on bootstrap and allow app usage.
        });
      } catch {
        if (alive) {
          Alert.alert("初期化エラー", "データの読み込みに失敗しました。");
        }
      } finally {
        if (alive) {
          setIsHydrated(true);
        }
      }
    };

    void bootstrap();

    return () => {
      alive = false;
    };
  }, [weekStart]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const todayKey = toDateKey(new Date());
  const moodCountToday = moodLogs.filter((log) => log.date === todayKey).length;
  const winCountToday = winLogs.filter((log) => log.date === todayKey).length;
  const sosCountToday = sosLogs.filter((log) => log.date === todayKey).length;
  const affirmationText = useMemo(
    () => deriveAffirmation(todayKey, moodLogs, winLogs, sosLogs),
    [todayKey, moodLogs, winLogs, sosLogs]
  );
  const insightMessage = useMemo(() => deriveInsightMessage(moodLogs, winLogs, sosLogs), [moodLogs, winLogs, sosLogs]);

  const renderScreen = (content: React.ReactNode) => (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.screenContainer}>
        {toast ? <AppToast visible={toast.visible} tone={toast.tone} message={toast.message} /> : null}
        <ScreenTransition screenKey={screen}>{content}</ScreenTransition>
      </View>
    </>
  );

  const handleToggleGentleMode = async () => {
    const previous = notificationSettings;
    const nextSettings: NotificationSettings = {
      ...previous,
      gentleMode: !previous.gentleMode
    };

    setNotificationSettings(nextSettings);

    try {
      await saveNotificationSettings(nextSettings);
      showToast("success", nextSettings.gentleMode ? "しんどい日モードを有効化しました" : "通常表示に戻しました");
    } catch {
      setNotificationSettings(previous);
      showToast("error", "表示モードの保存に失敗しました");
    }
  };

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryStart} />
          <Text style={styles.loadingText}>データを読み込み中です...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!onboardingCompleted) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <OnboardingFlow
          onCompleted={() => {
            setOnboardingCompleted(true);
            void saveOnboardingCompleted(true).catch(() => {
              Alert.alert("保存エラー", "オンボーディング状態の保存に失敗しました。");
            });
          }}
        />
      </>
    );
  }

  if (screen === "mood") {
    return renderScreen(
      <MoodEntryScreen
        onBack={() => setScreen("home")}
        onSave={async (payload) => {
          const moodLog: MoodLog = {
            id: createId("mood"),
            date: toDateKey(new Date()),
            moodLevel: payload.moodLevel,
            polarity: payload.polarity,
            note: payload.note,
            createdAt: nowIsoString()
          };

          setMoodLogs((prev) => [...prev, moodLog]);
          setScreen("home");

          try {
            await insertMoodLog(moodLog);
            showToast("success", "気分記録を保存しました");
          } catch {
            setMoodLogs((prev) => prev.filter((entry) => entry.id !== moodLog.id));
            showToast("error", "気分記録の保存に失敗しました");
          }
        }}
      />
    );
  }

  if (screen === "win") {
    return renderScreen(
      <WinEntryScreen
        onBack={() => setScreen("home")}
        onSave={async (payload) => {
          const winLog: WinLog = {
            id: createId("win"),
            date: toDateKey(new Date()),
            tags: payload.tags,
            note: payload.note,
            createdAt: nowIsoString()
          };

          setWinLogs((prev) => [...prev, winLog]);
          setScreen("home");

          try {
            await insertWinLog(winLog);
            showToast("success", "できたことを保存しました");
          } catch {
            setWinLogs((prev) => prev.filter((entry) => entry.id !== winLog.id));
            showToast("error", "できたこと記録の保存に失敗しました");
          }
        }}
      />
    );
  }

  if (screen === "sos") {
    return renderScreen(
      <SosModeScreen
        onBack={() => setScreen("home")}
        onDone={async ({ hydrationDone, breathingDone, restDone }) => {
          const hasCompletedTask = hydrationDone || breathingDone || restDone;
          if (!hasCompletedTask) {
            setScreen("home");
            return;
          }

          const sosLog: SosLog = {
            id: createId("sos"),
            date: toDateKey(new Date()),
            hydrationDone,
            breathingDone,
            restDone,
            createdAt: nowIsoString()
          };

          setSosLogs((prev) => [...prev, sosLog]);
          setScreen("home");

          try {
            await insertSosLog(sosLog);
            showToast("success", "非常モードの記録を保存しました");
          } catch {
            setSosLogs((prev) => prev.filter((entry) => entry.id !== sosLog.id));
            showToast("error", "非常モード記録の保存に失敗しました");
          }
        }}
      />
    );
  }

  if (screen === "calendar") {
    return renderScreen(<CalendarScreen onBack={() => setScreen("home")} moodLogs={moodLogs} winLogs={winLogs} sosLogs={sosLogs} />);
  }

  if (screen === "plan") {
    return renderScreen(
      <WeeklyPlanScreen
        weekStart={weekStart}
        goals={weeklyGoals}
        onBack={() => setScreen("home")}
        onOpenSummary={() => setScreen("summary")}
        onAddGoal={async (title) => {
          const goal: WeeklyGoal = {
            id: createId("goal"),
            weekStart,
            title,
            completed: false,
            createdAt: nowIsoString()
          };

          setWeeklyGoals((prev) => [...prev, goal]);
          try {
            await insertWeeklyGoal(goal);
            showToast("success", "週間目標を追加しました");
          } catch {
            setWeeklyGoals((prev) => prev.filter((entry) => entry.id !== goal.id));
            throw new Error("insert goal failed");
          }
        }}
        onToggleGoal={async (goalId, completed) => {
          const previous = weeklyGoals;
          setWeeklyGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, completed } : goal)));
          try {
            await updateWeeklyGoalCompletion(goalId, completed);
          } catch {
            setWeeklyGoals(previous);
            throw new Error("update goal failed");
          }
        }}
      />
    );
  }

  if (screen === "summary") {
    return renderScreen(
      <WeeklySummaryScreen
        weekStart={weekStart}
        goals={weeklyGoals}
        moodLogs={moodLogs}
        winLogs={winLogs}
        sosLogs={sosLogs}
        onBack={() => setScreen("plan")}
      />
    );
  }

  if (screen === "settings") {
    return renderScreen(
      <SettingsScreen
        initialSettings={notificationSettings}
        onBack={() => setScreen("home")}
        onSave={async (nextSettings) => {
          const previous = notificationSettings;
          setNotificationSettings(nextSettings);
          try {
            await saveNotificationSettings(nextSettings);
            const result = await syncDailyReminder(nextSettings, true);
            if (result === "permission_denied" && nextSettings.reminderEnabled) {
              Alert.alert("通知権限が必要です", "端末設定で通知を許可するとリマインドを受け取れます。");
            }
            showToast("success", "設定を保存しました");
            setScreen("home");
          } catch {
            setNotificationSettings(previous);
            throw new Error("save notification settings failed");
          }
        }}
        onResetOnboarding={() => {
          setScreen("home");
          setOnboardingCompleted(false);
          void saveOnboardingCompleted(false).catch(() => {
            Alert.alert("保存エラー", "オンボーディング状態の保存に失敗しました。");
          });
        }}
      />
    );
  }

  return renderScreen(
    <HomeScreen
      affirmationText={affirmationText}
      insightMessage={insightMessage}
      moodCountToday={moodCountToday}
      winCountToday={winCountToday}
      sosCountToday={sosCountToday}
      isGentleMode={notificationSettings.gentleMode}
      onToggleGentleMode={() => {
        void handleToggleGentleMode();
      }}
      onMoodPress={() => setScreen("mood")}
      onWinPress={() => setScreen("win")}
      onSosPress={() => setScreen("sos")}
      onCalendarPress={() => setScreen("calendar")}
      onPlanPress={() => setScreen("plan")}
      onSettingsPress={() => setScreen("settings")}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.muted
  }
});
