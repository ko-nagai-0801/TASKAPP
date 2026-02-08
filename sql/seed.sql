BEGIN TRANSACTION;

-- Recent mood logs (last 7 days style sample)
INSERT INTO mood_logs (date, mood_level, polarity, note, created_at) VALUES
  (date('now', '-6 day'), 2, 'low',  '朝が重かった',              strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 day')),
  (date('now', '-5 day'), 3, NULL,   '少し落ち着いた',            strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 day')),
  (date('now', '-4 day'), 4, 'high', '活動量が少し多め',          strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-4 day')),
  (date('now', '-3 day'), 3, NULL,   '普通',                      strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 day')),
  (date('now', '-2 day'), 2, 'low',  '疲れが残っている',          strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 day')),
  (date('now', '-1 day'), 3, NULL,   '記録はできた',              strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  (date('now'),          3, NULL,    '今日はここに来られた',      strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Recent win logs
INSERT INTO win_logs (date, tags, note, created_at) VALUES
  (date('now', '-6 day'), '["水分をとった"]',                         'ひと口でも飲めた',            strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 day')),
  (date('now', '-5 day'), '["起きられた","食事"]',                   NULL,                           strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 day')),
  (date('now', '-3 day'), '["外気を吸った"]',                         '5分だけベランダへ',           strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-3 day')),
  (date('now', '-1 day'), '["服薬した"]',                             NULL,                           strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')),
  (date('now'),           '["起きられた","水分をとった","記録した"]', '小さくても残せた',            strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Recent SOS logs
INSERT INTO sos_logs (date, hydration_done, breathing_done, rest_done, created_at) VALUES
  (date('now', '-2 day'), 1, 1, 0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-2 day')),
  (date('now'),           1, 0, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- Optional settings sample update
UPDATE settings
SET
  daily_reminder_time = '20:00',
  reminder_enabled = 1,
  emergency_contact_note = 'つらい時は主治医または信頼できる人へ連絡',
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 1;

COMMIT;
