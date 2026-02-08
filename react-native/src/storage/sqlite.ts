import * as SQLite from "expo-sqlite";
import { WeeklyGoal } from "../types/goals";
import { MoodLog, SosLog, WinLog } from "../types/logs";
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings } from "../types/settings";

const DB_NAME = "taskapp.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return databasePromise;
}

function parseTags(rawTags: string | null): string[] {
  if (!rawTags) {
    return [];
  }
  try {
    const parsed = JSON.parse(rawTags);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

async function ensureColumnExists(
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string,
  definitionSql: string
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  if (columns.some((column) => column.name === columnName)) {
    return;
  }
  await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definitionSql}`);
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS mood_logs (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
      polarity TEXT NULL CHECK (polarity IN ('low', 'high') OR polarity IS NULL),
      note TEXT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS win_logs (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      note TEXT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sos_logs (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      hydration_done INTEGER NOT NULL DEFAULT 0 CHECK (hydration_done IN (0, 1)),
      breathing_done INTEGER NOT NULL DEFAULT 0 CHECK (breathing_done IN (0, 1)),
      rest_done INTEGER NOT NULL DEFAULT 0 CHECK (rest_done IN (0, 1)),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      reminder_enabled INTEGER NOT NULL DEFAULT 1 CHECK (reminder_enabled IN (0, 1)),
      daily_reminder_time TEXT NULL,
      onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weekly_goals (
      id TEXT PRIMARY KEY NOT NULL,
      week_start TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_mood_logs_date ON mood_logs (date);
    CREATE INDEX IF NOT EXISTS idx_win_logs_date ON win_logs (date);
    CREATE INDEX IF NOT EXISTS idx_sos_logs_date ON sos_logs (date);
    CREATE INDEX IF NOT EXISTS idx_weekly_goals_week_start ON weekly_goals (week_start);

    INSERT OR IGNORE INTO settings (id, reminder_enabled, daily_reminder_time, onboarding_completed, updated_at)
    VALUES (1, 1, '20:00', 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
  `);

  await ensureColumnExists(db, "settings", "reminder_enabled", "INTEGER NOT NULL DEFAULT 1 CHECK (reminder_enabled IN (0, 1))");
  await ensureColumnExists(db, "settings", "daily_reminder_time", "TEXT NULL");

  await db.runAsync(
    `
      UPDATE settings
      SET
        reminder_enabled = COALESCE(reminder_enabled, 1),
        daily_reminder_time = COALESCE(daily_reminder_time, '20:00'),
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = 1
    `
  );
}

export async function loadOnboardingCompleted(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ onboarding_completed: number }>(
    `SELECT onboarding_completed FROM settings WHERE id = 1`
  );
  return row ? row.onboarding_completed === 1 : false;
}

export async function saveOnboardingCompleted(value: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE settings
      SET onboarding_completed = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = 1
    `,
    value ? 1 : 0
  );
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    reminder_enabled: number | null;
    daily_reminder_time: string | null;
  }>(
    `
      SELECT reminder_enabled, daily_reminder_time
      FROM settings
      WHERE id = 1
    `
  );

  if (!row) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  return {
    reminderEnabled: row.reminder_enabled === 1,
    reminderTime: row.daily_reminder_time || DEFAULT_NOTIFICATION_SETTINGS.reminderTime
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE settings
      SET
        reminder_enabled = ?,
        daily_reminder_time = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = 1
    `,
    settings.reminderEnabled ? 1 : 0,
    settings.reminderTime
  );
}

export async function loadMoodLogs(): Promise<MoodLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    mood_level: number;
    polarity: "low" | "high" | null;
    note: string | null;
    created_at: string;
  }>(`SELECT id, date, mood_level, polarity, note, created_at FROM mood_logs ORDER BY created_at ASC`);

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    moodLevel: row.mood_level,
    polarity: row.polarity,
    note: row.note ?? "",
    createdAt: row.created_at
  }));
}

export async function loadWinLogs(): Promise<WinLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    tags: string | null;
    note: string | null;
    created_at: string;
  }>(`SELECT id, date, tags, note, created_at FROM win_logs ORDER BY created_at ASC`);

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    tags: parseTags(row.tags),
    note: row.note ?? "",
    createdAt: row.created_at
  }));
}

export async function loadSosLogs(): Promise<SosLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    date: string;
    hydration_done: number;
    breathing_done: number;
    rest_done: number;
    created_at: string;
  }>(
    `
      SELECT id, date, hydration_done, breathing_done, rest_done, created_at
      FROM sos_logs
      ORDER BY created_at ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    hydrationDone: row.hydration_done === 1,
    breathingDone: row.breathing_done === 1,
    restDone: row.rest_done === 1,
    createdAt: row.created_at
  }));
}

export async function insertMoodLog(log: MoodLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO mood_logs (id, date, mood_level, polarity, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    log.id,
    log.date,
    log.moodLevel,
    log.polarity,
    log.note || null,
    log.createdAt
  );
}

export async function insertWinLog(log: WinLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO win_logs (id, date, tags, note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    log.id,
    log.date,
    JSON.stringify(log.tags),
    log.note || null,
    log.createdAt
  );
}

export async function insertSosLog(log: SosLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO sos_logs (id, date, hydration_done, breathing_done, rest_done, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    log.id,
    log.date,
    log.hydrationDone ? 1 : 0,
    log.breathingDone ? 1 : 0,
    log.restDone ? 1 : 0,
    log.createdAt
  );
}

export async function loadWeeklyGoals(weekStart: string): Promise<WeeklyGoal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    week_start: string;
    title: string;
    completed: number;
    created_at: string;
  }>(
    `
      SELECT id, week_start, title, completed, created_at
      FROM weekly_goals
      WHERE week_start = ?
      ORDER BY created_at ASC
    `,
    weekStart
  );

  return rows.map((row) => ({
    id: row.id,
    weekStart: row.week_start,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at
  }));
}

export async function insertWeeklyGoal(goal: WeeklyGoal): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      INSERT INTO weekly_goals (id, week_start, title, completed, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    goal.id,
    goal.weekStart,
    goal.title,
    goal.completed ? 1 : 0,
    goal.createdAt
  );
}

export async function updateWeeklyGoalCompletion(goalId: string, completed: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `
      UPDATE weekly_goals
      SET completed = ?
      WHERE id = ?
    `,
    completed ? 1 : 0,
    goalId
  );
}
