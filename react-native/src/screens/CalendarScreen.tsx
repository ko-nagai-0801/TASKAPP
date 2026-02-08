import React, { useMemo, useState } from "react";
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { StateBanner } from "../components/StateBanner";
import { colors, radius, spacing, typography } from "../design/tokens";
import { MoodLog, MoodPolarity, SosLog, toDateKey, WinLog } from "../types/logs";

type ViewMode = "week" | "month";
type DayTone = "none" | "recorded" | "low" | "high";

type DaySummary = {
  dateKey: string;
  date: Date;
  tone: DayTone;
  moodLogs: MoodLog[];
  winLogs: WinLog[];
  sosLogs: SosLog[];
  isFuture: boolean;
};

type CalendarScreenProps = {
  onBack: () => void;
  moodLogs: MoodLog[];
  winLogs: WinLog[];
  sosLogs: SosLog[];
};

type DateItem = {
  date: Date;
  dateKey: string;
};

function groupByDate<T extends { date: string }>(rows: T[]): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    if (!acc[row.date]) {
      acc[row.date] = [];
    }
    acc[row.date].push(row);
    return acc;
  }, {});
}

function getTone(moodEntries: MoodLog[], winEntries: WinLog[], sosEntries: SosLog[]): DayTone {
  const hasAnyRecord = moodEntries.length > 0 || winEntries.length > 0 || sosEntries.length > 0;
  if (!hasAnyRecord) {
    return "none";
  }

  const lowCount = moodEntries.filter((entry) => entry.polarity === "low").length;
  const highCount = moodEntries.filter((entry) => entry.polarity === "high").length;

  if (lowCount > highCount) {
    return "low";
  }
  if (highCount > lowCount) {
    return "high";
  }
  return "recorded";
}

function toneStyle(tone: DayTone) {
  if (tone === "recorded") {
    return styles.dayRecorded;
  }
  if (tone === "low") {
    return styles.dayLow;
  }
  if (tone === "high") {
    return styles.dayHigh;
  }
  return undefined;
}

function toneSymbol(tone: DayTone): string {
  if (tone === "recorded") {
    return "●";
  }
  if (tone === "low") {
    return "▼";
  }
  if (tone === "high") {
    return "▲";
  }
  return "・";
}

function buildRecentDays(referenceDate: Date, count: number): DateItem[] {
  const items: DateItem[] = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const current = new Date(referenceDate);
    current.setHours(0, 0, 0, 0);
    current.setDate(current.getDate() - index);
    items.push({ date: current, dateKey: toDateKey(current) });
  }
  return items;
}

function buildMonthDays(referenceDate: Date): DateItem[] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const items: DateItem[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    items.push({ date, dateKey: toDateKey(date) });
  }
  return items;
}

function moodPolarityLabel(value: MoodPolarity): string {
  if (value === "low") {
    return "低め";
  }
  if (value === "high") {
    return "高め";
  }
  return "なし";
}

function formatMonthDay(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function CalendarScreen({ onBack, moodLogs, winLogs, sosLogs }: CalendarScreenProps) {
  const [mode, setMode] = useState<ViewMode>("week");
  const [selectedDay, setSelectedDay] = useState<DaySummary | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const moodMap = useMemo(() => groupByDate(moodLogs), [moodLogs]);
  const winMap = useMemo(() => groupByDate(winLogs), [winLogs]);
  const sosMap = useMemo(() => groupByDate(sosLogs), [sosLogs]);

  const dayItems = useMemo(() => {
    const baseDays = mode === "week" ? buildRecentDays(today, 7) : buildMonthDays(today);

    return baseDays.map<DaySummary>((item) => {
      const moodEntries = moodMap[item.dateKey] ?? [];
      const winEntries = winMap[item.dateKey] ?? [];
      const sosEntries = sosMap[item.dateKey] ?? [];

      return {
        dateKey: item.dateKey,
        date: item.date,
        tone: getTone(moodEntries, winEntries, sosEntries),
        moodLogs: moodEntries,
        winLogs: winEntries,
        sosLogs: sosEntries,
        isFuture: item.date > today
      };
    });
  }, [mode, moodMap, sosMap, today, winMap]);

  const hasAnyVisibleRecord = useMemo(
    () => dayItems.some((item) => item.tone !== "none"),
    [dayItems]
  );

  const moodSummary = useMemo(() => {
    if (!selectedDay || selectedDay.moodLogs.length === 0) {
      return "記録なし";
    }
    return selectedDay.moodLogs
      .map((entry) => `${entry.moodLevel}（${moodPolarityLabel(entry.polarity)}）`)
      .join(" / ");
  }, [selectedDay]);

  const winSummary = useMemo(() => {
    if (!selectedDay || selectedDay.winLogs.length === 0) {
      return "記録なし";
    }
    const snippets = selectedDay.winLogs.flatMap((entry) => {
      const parts: string[] = [];
      if (entry.tags.length > 0) {
        parts.push(entry.tags.join("、"));
      }
      if (entry.note) {
        parts.push(entry.note);
      }
      return parts;
    });
    return snippets.slice(0, 3).join(" / ");
  }, [selectedDay]);

  const sosSummary = useMemo(() => {
    if (!selectedDay || selectedDay.sosLogs.length === 0) {
      return "実行なし";
    }
    const taskDoneCount = selectedDay.sosLogs.reduce((acc, entry) => {
      return acc + Number(entry.hydrationDone) + Number(entry.breathingDone) + Number(entry.restDone);
    }, 0);
    return `${selectedDay.sosLogs.length}回（完了タスク合計 ${taskDoneCount}）`;
  }, [selectedDay]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>積み上げカレンダー</Text>

        <View style={styles.switchRow}>
          <Pressable
            onPress={() => setMode("week")}
            style={[styles.switchBtn, mode === "week" && styles.switchBtnActive]}
          >
            <Text style={[styles.switchText, mode === "week" && styles.switchTextActive]}>週</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("month")}
            style={[styles.switchBtn, mode === "month" && styles.switchBtnActive]}
          >
            <Text style={[styles.switchText, mode === "month" && styles.switchTextActive]}>月</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {dayItems.map((item) => (
            <Pressable
              key={item.dateKey}
              style={[styles.dayCell, toneStyle(item.tone), item.isFuture && styles.futureDay]}
              onPress={() => setSelectedDay(item)}
              accessibilityRole="button"
              accessibilityLabel={`${formatMonthDay(item.date)} ${item.tone}`}
            >
              <Text style={styles.dayText}>{item.date.getDate()}</Text>
              <Text style={styles.daySymbol}>{toneSymbol(item.tone)}</Text>
            </Pressable>
          ))}
        </View>

        {!hasAnyVisibleRecord ? (
          <StateBanner tone="empty" title="表示範囲に記録がありません" message="気分またはできたことを1件保存すると反映されます。" />
        ) : null}

        <AppCard tone="info">
          <Text style={styles.legendText}>凡例: ● 記録あり / ▼ 低め傾向 / ▲ 高め傾向 / ・ なし</Text>
        </AppCard>

        <AppButton label="ホームに戻る" onPress={onBack} variant="ghost" />
      </View>

      <Modal visible={selectedDay !== null} transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedDay(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{selectedDay ? `${formatMonthDay(selectedDay.date)}の記録` : ""}</Text>

            {selectedDay?.isFuture ? (
              <Text style={styles.modalBody}>まだ記録はありません</Text>
            ) : (
              <>
                <Text style={styles.modalBody}>{`気分: ${moodSummary}`}</Text>
                <Text style={styles.modalBody}>{`できたこと: ${winSummary}`}</Text>
                <Text style={styles.modalBody}>{`SOS: ${sosSummary}`}</Text>
              </>
            )}

            <View style={styles.modalAction}>
              <AppButton label="閉じる" onPress={() => setSelectedDay(null)} variant="ghost" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  switchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  switchBtn: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  switchBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryStart
  },
  switchText: {
    fontSize: typography.body,
    color: colors.text
  },
  switchTextActive: {
    color: colors.primaryStart,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  dayCell: {
    width: "13.2%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface
  },
  dayRecorded: {
    backgroundColor: colors.successSoft
  },
  dayLow: {
    backgroundColor: colors.infoSoft
  },
  dayHigh: {
    backgroundColor: colors.warningSoft
  },
  futureDay: {
    opacity: 0.6
  },
  dayText: {
    color: colors.text,
    fontSize: typography.caption
  },
  daySymbol: {
    color: colors.textSubtle,
    fontSize: 10
  },
  legendText: {
    color: colors.textSubtle,
    fontSize: typography.caption,
    lineHeight: 18
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: spacing.lg
  },
  modalCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700"
  },
  modalBody: {
    color: colors.muted,
    fontSize: typography.caption
  },
  modalAction: {
    marginTop: spacing.sm
  }
});
