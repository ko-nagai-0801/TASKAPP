# ちいさな肯定 MVP 詳細設計

## 1. システム構成（MVP）
- クライアント: モバイルアプリ（React NativeまたはFlutter想定）
- 永続化: ローカルDB（SQLite）
- 通知: 端末ローカル通知
- 通信: なし（MVPはオフライン完結）

## 2. 画面一覧
1. Onboarding1
2. Onboarding2
3. Onboarding3（同意含む）
4. Home
5. MoodEntry
6. WinEntry
7. Calendar
8. SosMode

## 3. 画面詳細設計

### 3.1 Onboarding（共通）
- 入力:
  - 同意チェック（Onboarding3のみ必須）
- ボタン:
  - `次へ` / `戻る` / `スキップ` / `はじめる`
- バリデーション:
  - 同意未チェックで `はじめる` 押下時にエラー表示
- 例外:
  - スキップ時も同意が必要

### 3.2 Home
- 表示:
  - 今日の肯定メッセージ
  - `気分を記録` `できたことを記録` `非常モード`
  - 当日記録ステータス
- 挙動:
  - 日付変更時に「今日の状態」を再計算

### 3.3 MoodEntry
- 入力:
  - `mood_level`（1..5, 必須）
  - `polarity`（low/high/null）
  - `note`（0..80文字）
- 保存処理:
  - `mood_logs` へINSERT
  - Homeに戻る前に肯定メッセージ再計算
- エラー:
  - 必須未入力、文字数超過、DB保存失敗

### 3.4 WinEntry
- 入力:
  - `tags`（0個以上）
  - `note`（0..100文字）
- バリデーション:
  - `tags` と `note` が同時に空なら保存不可
- 保存処理:
  - `win_logs` へINSERT
  - 保存後トースト表示

### 3.5 Calendar
- 表示:
  - 週/月切替
  - 日セル（記録なし/記録あり/低め傾向/高め傾向）
- 挙動:
  - 日付タップで当日詳細モーダル表示
  - 未来日は詳細なし

### 3.6 SosMode
- 表示:
  - 固定メッセージ
  - タスク3項目チェック
  - 連絡先メモ（設定済み時）
- 保存:
  - タスク実行有無を `sos_logs` に保存（任意）

## 4. データ設計

### 4.1 テーブル定義

#### `mood_logs`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `date` TEXT NOT NULL（YYYY-MM-DD）
- `mood_level` INTEGER NOT NULL CHECK(mood_level BETWEEN 1 AND 5)
- `polarity` TEXT NULL CHECK(polarity IN ('low','high') OR polarity IS NULL)
- `note` TEXT NULL
- `created_at` TEXT NOT NULL（ISO8601）

#### `win_logs`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `date` TEXT NOT NULL
- `tags` TEXT NOT NULL DEFAULT '[]'（JSON配列文字列）
- `note` TEXT NULL
- `created_at` TEXT NOT NULL

#### `sos_logs`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `date` TEXT NOT NULL
- `hydration_done` INTEGER NOT NULL DEFAULT 0
- `breathing_done` INTEGER NOT NULL DEFAULT 0
- `rest_done` INTEGER NOT NULL DEFAULT 0
- `created_at` TEXT NOT NULL

#### `settings`
- `id` INTEGER PRIMARY KEY CHECK(id = 1)
- `locale` TEXT NOT NULL DEFAULT 'ja'
- `daily_reminder_time` TEXT NULL（HH:mm）
- `reminder_enabled` INTEGER NOT NULL DEFAULT 1
- `emergency_contact_note` TEXT NULL
- `onboarding_completed` INTEGER NOT NULL DEFAULT 0
- `updated_at` TEXT NOT NULL

### 4.2 インデックス
- `idx_mood_logs_date` ON `mood_logs(date)`
- `idx_win_logs_date` ON `win_logs(date)`
- `idx_sos_logs_date` ON `sos_logs(date)`

## 5. 業務ロジック設計

### 5.1 肯定メッセージ生成（ルールベース）
- 入力: 当日の `mood_logs` / `win_logs` / `sos_logs`
- ルール:
  1. winが1件以上 -> 「小さな行動を積み上げられています」
  2. winなし + moodあり -> 「記録したこと自体が前進です」
  3. sos実行あり -> 「しんどい中でケアを選べています」
  4. 何もなし -> 「ここに来ただけで十分です」

### 5.2 カレンダーセル状態判定
- 記録なし: 当日全テーブル0件
- 記録あり: mood/win/sosのいずれか1件以上
- 低め傾向: `polarity='low'` 件数 > `high` 件数
- 高め傾向: `polarity='high'` 件数 > `low` 件数

## 6. ルーティング・状態遷移
- 初回起動:
  - `settings.onboarding_completed=0` -> Onboarding1
- 通常起動:
  - Onboarding完了済み -> Home
- 遷移:
  - Home -> MoodEntry -> Home
  - Home -> WinEntry -> Home
  - Home -> SosMode -> Home
  - Home <-> Calendar

## 7. バリデーション仕様
- MoodEntry:
  - `mood_level` 必須
  - `note.length <= 80`
- WinEntry:
  - (`tags.length > 0` OR `note.length > 0`) 必須
  - `note.length <= 100`
- Onboarding3:
  - 同意チェック必須

## 8. 通知仕様
- 種別: ローカル通知
- 頻度: 1日1回
- デフォルト時刻: 20:00（端末ローカル時刻）
- 文言:
  - ja: 「1分だけ、今の状態を残しますか」
  - en: "Would you like to log how you feel in one minute?"

## 9. 計測イベント定義（ローカル）
- `onboarding_completed`
- `mood_saved`
- `win_saved`
- `sos_opened`
- `sos_task_checked`
- `calendar_opened`
- `notification_opened`

各イベント共通プロパティ:
- `timestamp`
- `locale`
- `screen`

## 10. エラーハンドリング
- DB書き込み失敗:
  - トースト表示 + 再試行導線
- 文字数超過:
  - 入力欄下に即時エラー表示
- 想定外例外:
  - アプリ継続可能な場合はHomeへフォールバック

## 11. テスト観点
1. 画面遷移テスト
- 主要導線（Home起点）が全て戻れる

2. バリデーションテスト
- 文字数境界値（80/81, 100/101）
- 必須チェック（mood, 同意）

3. 永続化テスト
- 保存後再起動でデータ保持
- 日付別集計が正しい

4. 通知テスト
- ON/OFF切替
- 指定時刻に1回のみ発火

## 12. 将来拡張ポイント
- クラウド同期API層の追加
- セキュアストレージ導入
- パーソナライズ肯定文（AI）
