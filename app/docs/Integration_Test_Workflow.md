# Google API Integration Test Workflow

本ドキュメントでは、Google Slide API / Drive API を使用した統合テスト（E2Eテスト）の環境構築と実行ワークフロー詳細について解説します。

## 1. 概要

本プロジェクトでは、モックを使用せず、実際の Google API と通信を行う統合テストを提供しています。
これにより、以下の要素を確実に検証可能です。

- **認証フロー**: OAuth 2.0 のトークン取得とリフレッシュ処理。
- **権限設定**: `drive.file` スコープでのファイルアクセス権。
- **API仕様**: Google Slides API (create, batchUpdate) のリクエスト/レスポンス構造の正当性。

## 2. 事前準備 (Google Cloud Console)

テストを実行するには、Google Cloud Project 側での設定が必要です。

1.  **API の有効化**:
    - Google Drive API
2.  **OAuth 同意画面 (OAuth Consent Screen)**:
    - User Type: `External` (テスト用)
    - Test users: テストを実行する自身の Google アカウントを追加。
    - Scopes:
      - `https://www.googleapis.com/auth/drive.file`
3.  **認証情報 (Credentials)**:
    - **OAuth 2.0 Clint ID** を作成（Application type: **Web application**）。
    - **Authorized redirect URIs** に `http://localhost:3000/oauth2callback` を追加。

## 3. テスト環境のセットアップ

テスト用の環境変数は `.env.test` ファイルで管理されます。

### Step 1: ファイルの作成

テンプレートから設定ファイルを作成します。

```bash
cp .env.test.template .env.test
```

`.env.test` を開き、GCP コンソールから取得した Client ID と Secret を記入します。

```dotenv
TEST_GOOGLE_CLIENT_ID=your_client_id
TEST_GOOGLE_CLIENT_SECRET=your_client_secret
```

### Step 2: リフレッシュトークンの取得 (`npm run test:token`)

テストを自動化するため、有効期限の短いアクセストークンではなく、**リフレッシュトークン**を取得します。ヘルパースクリプトを使用します。

```bash
npm run test:token
```

1.  コマンドを実行すると、ターミナルに認証用 URL が表示されます。
2.  ブラウザで URL を開き、Google アカウントでログイン・アクセス許可を行います。
3.  `http://localhost:3000/oauth2callback` にリダイレクトされ、認証成功メッセージが表示されます。
4.  ターミナルに戻ると、`TEST_GOOGLE_REFRESH_TOKEN` が表示されています。
5.  これを `.env.test` にコピペしてください。

```dotenv
TEST_GOOGLE_REFRESH_TOKEN=1//0xxxxxxxx...
```

### Step 3: テスト用テンプレートの作成 (`npm run template:create`)

統合テストでは、ベースとなるスライド（テンプレート）をコピーして使用します。
アプリ自身が作成したファイルであれば `drive.file` スコープでアクセス可能となるため、以下のスクリプトで正規のテンプレートを作成します。

```bash
npm run template:create
```

1.  スクリプトが API を叩き、Google Drive に新規スライドを作成します。
2.  作成された `Presentation ID` と編集用 URL が表示されます。
    - 必要に応じて URL を開き、スライドのレイアウト等を編集してください。
3.  表示された ID を `.env.test` に設定します。

```dotenv
TEST_TEMPLATE_ID=your_presentation_id
```

### Step 4: Gemini API Key (Optional for Chat Test)

Chat機能のテストを行う場合は、Gemini API Key を設定します。
[Google AI Studio](https://aistudio.google.com/) からキーを取得してください。

```dotenv
TEST_GEMINI_API_KEY=AIzr...
```

## 4. 統合テストの実行

すべての設定が完了したら、統合テストを実行します。

```bash
npm run test:integration
```

### 実行フロー

1.  `.env.test` を読み込みます。
2.  Refresh Token を使用して、最新の Access Token を取得します。
3.  `TEST_TEMPLATE_ID` のスライドをコピーし、新しいプレゼンテーションを作成します (`drive.files.copy`)。
4.  作成したスライドに対し、テキスト置換などの編集リクエストを送信します (`slides.presentations.batchUpdate`)。
5.  エラーなく完了すればテストパスとなります (`✅ Created Presentation ID: ...`)。

---

## 付録: スクリプト詳細

| コマンド                   | ファイル                       | 説明                                                                                                 |
| :------------------------- | :----------------------------- | :--------------------------------------------------------------------------------------------------- |
| `npm run test:token`       | `scripts/get-refresh-token.ts` | ローカルサーバーを起動し、OAuth 2.0 Web Server Flow を実行してリフレッシュトークンを取得します。     |
| `npm run template:create`  | `scripts/create-template.ts`   | 指定されたクレデンシャルを用いて、テストのマスターとなるスライドを Google Drive 上に新規作成します。 |
| `npm run test:integration` | `scripts/run-integration.sh`   | 環境変数をロードし、`vitest` で統合テストファイルのシナリオを実行します。                            |
