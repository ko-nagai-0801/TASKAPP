import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "./design/tokens";
import { syncDailyReminder } from "./notifications/reminder";
import { OnboardingFlow } from "./onboarding";
import { CalendarScreen } from "./screens/CalendarScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MoodEntryScreen } from "./screens/MoodEntryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SosModeScreen } from "./screens/SosModeScreen";
import { WinEntryScreen } from "./screens/WinEntryScreen";
import {
  initDatabase,
  insertMoodLog,
  insertSosLog,
  insertWinLog,
  loadMoodLogs,
  loadNotificationSettings,
  loadOnboardingCompleted,
  loadSosLogs,
  loadWinLogs,
  saveNotificationSettings,
  saveOnboardingCompleted
} from "./storage/sqlite";
import { MoodLog, nowIsoString, SosLog, toDateKey, WinLog } from "./types/logs";
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings } from "./types/settings";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

export default function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [screen, setScreen] = useState<"home" | "mood" | "win" | "sos" | "calendar" | "settings">("home");
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [winLogs, setWinLogs] = useState<WinLog[]>([]);
  const [sosLogs, setSosLogs] = useState<SosLog[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      try {
        await initDatabase();
        const [savedOnboardingCompleted, savedMoodLogs, savedWinLogs, savedSosLogs, savedNotificationSettings] = await Promise.all([
          loadOnboardingCompleted(),
          loadMoodLogs(),
          loadWinLogs(),
          loadSosLogs(),
          loadNotificationSettings()
        ]);

        if (!alive) {
          return;
        }

        setOnboardingCompleted(savedOnboardingCompleted);
        setMoodLogs(savedMoodLogs);
        setWinLogs(savedWinLogs);
        setSosLogs(savedSosLogs);
        setNotificationSettings(savedNotificationSettings);
        void syncDailyReminder(savedNotificationSettings, false).catch(() => {
          // Ignore sync failures on bootstrap and allow app usage.
        });
      } catch (error) {
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
  }, []);

  const todayKey = toDateKey(new Date());
  const moodCountToday = moodLogs.filter((log) => log.date === todayKey).length;
  const winCountToday = winLogs.filter((log) => log.date === todayKey).length;
  const sosCountToday = sosLogs.filter((log) => log.date === todayKey).length;
  const affirmationText = useMemo(
    () => deriveAffirmation(todayKey, moodLogs, winLogs, sosLogs),
    [todayKey, moodLogs, winLogs, sosLogs]
  );

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
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
            } catch {
              setMoodLogs((prev) => prev.filter((entry) => entry.id !== moodLog.id));
              Alert.alert("保存エラー", "気分記録の保存に失敗しました。");
            }
          }}
        />
      </>
    );
  }

  if (screen === "win") {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
            } catch {
              setWinLogs((prev) => prev.filter((entry) => entry.id !== winLog.id));
              Alert.alert("保存エラー", "できたこと記録の保存に失敗しました。");
            }
          }}
        />
      </>
    );
  }

  if (screen === "sos") {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
            } catch {
              setSosLogs((prev) => prev.filter((entry) => entry.id !== sosLog.id));
              Alert.alert("保存エラー", "非常モード記録の保存に失敗しました。");
            }
          }}
        />
      </>
    );
  }

  if (screen === "calendar") {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <CalendarScreen
          onBack={() => setScreen("home")}
          moodLogs={moodLogs}
          winLogs={winLogs}
          sosLogs={sosLogs}
        />
      </>
    );
  }

  if (screen === "settings") {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
              setScreen("home");
            } catch (error) {
              setNotificationSettings(previous);
              throw error;
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
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <HomeScreen
        affirmationText={affirmationText}
        moodCountToday={moodCountToday}
        winCountToday={winCountToday}
        sosCountToday={sosCountToday}
        onMoodPress={() => setScreen("mood")}
        onWinPress={() => setScreen("win")}
        onSosPress={() => setScreen("sos")}
        onCalendarPress={() => setScreen("calendar")}
        onSettingsPress={() => setScreen("settings")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
