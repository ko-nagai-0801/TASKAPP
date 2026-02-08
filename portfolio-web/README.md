# portfolio-web

ポートフォリオ用LP（Next.js App Router）です。1ページ構成で、必要に応じて実績詳細ページを増やせます。

## ローカル起動

```bash
cd /Users/mymac/TaskAPP/portfolio-web
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## GitHub 連携

```bash
git checkout -b codex/portfolio-lp
cd /Users/mymac/TaskAPP
git add portfolio-web
git commit -m "Add Next.js portfolio LP starter"
git push -u origin codex/portfolio-lp
```

## Vercel 公開

1. Vercel に GitHub リポジトリを接続
2. `Root Directory` を `portfolio-web` に設定
3. Build Command: `npm run build`
4. Output は Next.js のデフォルト設定のままでOK
5. `main` ブランチへマージで本番自動デプロイ

## 先に変更すべき箇所

- `/Users/mymac/TaskAPP/portfolio-web/src/app/page.tsx` の実績文面
- `/Users/mymac/TaskAPP/portfolio-web/src/app/page.tsx` の連絡先 (`mailto`, GitHub URL)
- `/Users/mymac/TaskAPP/portfolio-web/src/app/layout.tsx` の `metadata`
