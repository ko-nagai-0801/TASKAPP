# ちいさな肯定（taskapp-mobile）

精神障害者（うつ病・双極性障害など）の方向けに、  
「小さな達成の可視化」と「自己肯定感の積み上げ」を支援するモバイルアプリのMVPです。

## 現在の実装範囲

- オンボーディング（3画面 / 同意チェック必須）
- ホーム（今日の肯定文、主要導線）
- 気分記録（1-5段階、低め/高め、メモ）
- できたこと記録（クイックタグ、自由入力）
- 非常モード（3タスクチェック）
- 積み上げカレンダー（週/月表示、日付詳細モーダル）
- 設定（通知ON/OFF、通知時刻）
- SQLite永続化（再起動後もデータ保持）
- ローカル通知（毎日1回）

## 技術スタック

- Expo SDK 54
- React Native 0.81
- TypeScript
- `expo-sqlite`
- `expo-notifications`

## セットアップ

```bash
cd /Users/mymac/TaskAPP/react-native
npm install
```

## 起動方法

```bash
# Web
npm run web

# iOS (Simulator / 実機)
npm run ios

# Android (Emulator / 実機)
npm run android
```

## 開発チェック

```bash
# 型チェック
npx tsc --noEmit

# Webビルド確認
npx expo export --platform web
```

## 主要画面フロー

1. 初回起動: Onboarding1 -> Onboarding2 -> Onboarding3（同意）-> Home  
2. Home -> MoodEntry / WinEntry / SosMode / Calendar / Settings  
3. 記録保存後は Home に戻り、当日件数と肯定文が更新  
4. Calendar では保存済みデータを色分け表示（記録あり / 低め優勢 / 高め優勢）

## データ保存（SQLite）

DB名: `taskapp.db`  
主要テーブル:

- `mood_logs`
- `win_logs`
- `sos_logs`
- `settings`

`settings` で保持:

- `onboarding_completed`
- `reminder_enabled`
- `daily_reminder_time`

## 通知仕様

- 1日1回のローカル通知をスケジュール
- 設定画面で ON/OFF と時刻（`HH:mm`）を保存
- 通知ON時、必要に応じて権限リクエスト
- Webでは通知スケジュールをスキップ（モバイル実機/シミュレータ想定）

## ディレクトリ構成（抜粋）

```text
react-native/
  src/
    App.tsx
    components/
    design/
    notifications/
    onboarding/
    screens/
    storage/
    types/
  app.json
  metro.config.js
  tsconfig.json
```

## 補足

- Nodeは `20.19.4+` 推奨（現環境 `20.11.1` では警告が出る場合あり）
- `metro.config.js` で `wasm` を `assetExts` に追加（`expo-sqlite` Web対応）
