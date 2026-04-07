# 名取めぐみ ポートフォリオサイト

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| バックエンド | Express.js + TypeScript |
| ORM | Prisma |
| データベース | PostgreSQL |
| 認証 | Firebase Authentication |
| スタイリング | Tailwind CSS |

---

## セットアップ手順

### 1. 前提条件

- Node.js 18以上
- PostgreSQL（ローカルまたはクラウド）
- Firebase プロジェクト（個人アカウント）

---

### 2. Firebaseの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. **Authentication** → メール/パスワード認証を有効化
3. Authentication → Users でご自身のメールアドレスを登録
4. プロジェクト設定 → **アプリを追加（Web）** → 設定値をコピー（フロントエンド用）
5. プロジェクト設定 → **サービスアカウント** → 新しい秘密鍵を生成（バックエンド用）

---

### 3. バックエンドのセットアップ

```bash
cd backend
npm install

# 環境変数ファイルを作成
cp .env.example .env
# .env を編集して各種設定を入力

# Prismaのマイグレーション実行
npx prisma migrate dev --name init

# 開発サーバー起動
npm run dev
```

---

### 4. フロントエンドのセットアップ

```bash
cd frontend
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
# .env.local を編集してFirebase設定などを入力

# 開発サーバー起動
npm run dev
```

フロントエンド: http://localhost:3000
バックエンド: http://localhost:4000

---

## 主な機能

### 公開ページ
- **トップページ** (`/`) — プロフィール・実績・スキル
- **お問い合わせ** (`/contact`) — 問い合わせフォーム

### 管理画面（要ログイン）
- **ログイン** (`/admin/login`) — Firebase認証
- **管理画面** (`/admin`) — プロフィール・画像の編集

### アクセス制御
- 未認証ユーザが `/admin` にアクセスした場合 → **404** を返す
- セッションはFirebase Admin SDKで発行したCookieで管理

---

## ディレクトリ構成

```
portfolio/
├── frontend/                   # Next.js App Router
│   ├── app/
│   │   ├── page.tsx            # トップページ
│   │   ├── contact/page.tsx    # お問い合わせ
│   │   └── admin/              # 管理画面
│   ├── components/             # UIコンポーネント
│   ├── lib/                    # Firebase・API設定
│   └── middleware.ts           # アクセス制御（404）
│
└── backend/                    # Express.js API
    ├── src/
    │   ├── routes/             # APIルート
    │   ├── middleware/         # Firebase認証ミドルウェア
    │   └── lib/                # Firebase Admin・Prisma
    └── prisma/
        └── schema.prisma       # DBスキーマ定義
```
