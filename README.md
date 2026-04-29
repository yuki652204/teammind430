# TeamMind — AI社内ナレッジベース MVP

## アーキテクチャ

```
Frontend (Next.js 14 App Router)
  ├── 認証: NextAuth.js (Google / GitHub OAuth)
  ├── UI: Tailwind CSS + React
  └── MDX Editor + Markdown Preview

Backend (Next.js API Routes)
  ├── /api/auth     — NextAuth
  ├── /api/projects — プロジェクトCRUD
  ├── /api/articles — 記事CRUD + Embedding生成
  ├── /api/search   — AI類似検索
  └── /api/invites  — 招待リンク参加

Database (Supabase PostgreSQL + pgvector)
  ├── users / projects / memberships
  ├── articles (embedding: VECTOR(1536))
  └── search_logs (使用量管理)

AI (OpenAI)
  ├── text-embedding-3-small — ベクトル化
  └── gpt-4o-mini — 回答生成
```

## セットアップ

### 1. 環境変数

```bash
cp .env.local.example .env.local
# 各値を設定
```

### 2. Supabaseセットアップ

```bash
# Supabaseプロジェクト作成後
# SQL Editorで supabase/migrations/001_init.sql を実行
```

### 3. OAuth設定

- **Google**: https://console.cloud.google.com → OAuth 2.0クライアントID作成
- **GitHub**: Settings > Developer settings > OAuth Apps

### 4. 起動

```bash
npm install
npm run dev
```

## フリーミアム制限

| 機能 | Free | Pro |
|------|------|-----|
| プロジェクト | 1 | 無制限 |
| メンバー | 5名 | 無制限 |
| 記事 | 50件 | 無制限 |
| AI検索 | 50回/月 | 無制限 |

## Vercelデプロイ

```bash
# 環境変数をVercelダッシュボードで設定
vercel --prod
```
