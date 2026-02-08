PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS mood_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  polarity TEXT NULL CHECK (polarity IN ('low', 'high') OR polarity IS NULL),
  note TEXT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS win_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  note TEXT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sos_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  hydration_done INTEGER NOT NULL DEFAULT 0 CHECK (hydration_done IN (0, 1)),
  breathing_done INTEGER NOT NULL DEFAULT 0 CHECK (breathing_done IN (0, 1)),
  rest_done INTEGER NOT NULL DEFAULT 0 CHECK (rest_done IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  locale TEXT NOT NULL DEFAULT 'ja',
  daily_reminder_time TEXT NULL,
  reminder_enabled INTEGER NOT NULL DEFAULT 1 CHECK (reminder_enabled IN (0, 1)),
  emergency_contact_note TEXT NULL,
  onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mood_logs_date ON mood_logs (date);
CREATE INDEX IF NOT EXISTS idx_win_logs_date ON win_logs (date);
CREATE INDEX IF NOT EXISTS idx_sos_logs_date ON sos_logs (date);

INSERT OR IGNORE INTO settings (
  id,
  locale,
  daily_reminder_time,
  reminder_enabled,
  emergency_contact_note,
  onboarding_completed,
  updated_at
) VALUES (
  1,
  'ja',
  NULL,
  1,
  NULL,
  0,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

COMMIT;
