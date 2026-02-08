BEGIN TRANSACTION;

DELETE FROM mood_logs;
DELETE FROM win_logs;
DELETE FROM sos_logs;
DELETE FROM settings;

INSERT INTO settings (
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
