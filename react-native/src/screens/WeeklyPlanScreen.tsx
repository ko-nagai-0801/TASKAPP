import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { colors, radius, spacing, typography } from "../design/tokens";
import { WeeklyGoal } from "../types/goals";

type WeeklyPlanScreenProps = {
  weekStart: string;
  goals: WeeklyGoal[];
  onBack: () => void;
  onAddGoal: (title: string) => Promise<void>;
  onToggleGoal: (goalId: string, completed: boolean) => Promise<void>;
  onOpenSummary: () => void;
};

export function WeeklyPlanScreen({
  weekStart,
  goals,
  onBack,
  onAddGoal,
  onToggleGoal,
  onOpenSummary
}: WeeklyPlanScreenProps) {
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = useMemo(() => goals.filter((goal) => goal.completed).length, [goals]);

  const handleAddGoal = async () => {
    setError("");
    const trimmed = newGoalTitle.trim();
    if (trimmed.length === 0) {
      setError("目標を入力してください");
      return;
    }
    if (trimmed.length > 60) {
      setError("目標は60文字以内で入力してください");
      return;
    }

    setIsSaving(true);
    try {
      await onAddGoal(trimmed);
      setNewGoalTitle("");
    } catch {
      setError("目標の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (goal: WeeklyGoal) => {
    setError("");
    try {
      await onToggleGoal(goal.id, !goal.completed);
    } catch {
      setError("目標の更新に失敗しました");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>週間プラン</Text>
        <AppCard>
          <Text style={styles.label}>{`週の開始日: ${weekStart}`}</Text>
          <Text style={styles.subLabel}>{`進捗: ${completedCount}/${goals.length}`}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.label}>今週の目標を追加</Text>
          <TextInput
            value={newGoalTitle}
            onChangeText={setNewGoalTitle}
            placeholder="例: 1日1回、気分を記録する"
            placeholderTextColor={colors.muted}
            maxLength={60}
            style={styles.input}
          />
          <Text style={styles.counter}>{newGoalTitle.length}/60</Text>
          <AppButton label={isSaving ? "追加中..." : "目標を追加"} onPress={() => void handleAddGoal()} />
        </AppCard>

        <AppCard>
          <Text style={styles.label}>目標一覧</Text>
          {goals.length === 0 ? (
            <Text style={styles.subLabel}>まだ目標がありません</Text>
          ) : (
            goals.map((goal) => (
              <Pressable key={goal.id} onPress={() => void handleToggle(goal)} style={styles.goalRow}>
                <Text style={styles.goalCheck}>{goal.completed ? "[x]" : "[ ]"}</Text>
                <Text style={[styles.goalText, goal.completed && styles.goalTextDone]}>{goal.title}</Text>
              </Pressable>
            ))
          )}
        </AppCard>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton label="戻る" variant="ghost" onPress={onBack} />
          <AppButton label="週次サマリー" onPress={onOpenSummary} />
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
  label: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600"
  },
  subLabel: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.muted
  },
  input: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    color: colors.text
  },
  counter: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: "right",
    color: colors.muted,
    fontSize: typography.caption
  },
  goalRow: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.surface
  },
  goalCheck: {
    color: colors.text,
    fontSize: typography.body,
    width: 28
  },
  goalText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body
  },
  goalTextDone: {
    textDecorationLine: "line-through",
    color: colors.muted
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
