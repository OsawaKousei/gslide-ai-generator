# Current Implementation Status Report for GSlide-AI-Generator

**Date:** 2026-01-18
**Version:** 0.5.0 (Pre-Alpha / PoC)

本ドキュメントは、現在のアプリケーション実装状況を客観的に評価し、実装済みの機能と残存する課題（Gap Analysis）を明確化したものです。

---

## 1. 実装済み機能 (Implemented Features)

### 1 Infrastructure & Architecture

- **Tech Stack:** Vite, React, TypeScript, Zustand, Tailwind CSS.
- **Environment:** Dev Container (Docker) ベースの再現性の高い開発環境。
- **Quality Control:** ESLint, Prettier, Vitest による静的解析・テスト基盤が稼働中。

### 2. Authentication & Security

- **Providers:** Google Identity Services (GIS) による OAuth 2.0 認証。
- **Scope Strategy:** 必要最小限の権限 (`drive.file`) を採用。アプリが作成したファイルのみにアクセスするため、ユーザーの既存ファイルを不当に読み取るリスクを排除。
- **Secrets Management:** Gemini API Key はローカルストレージ (`localStorage`) に保存し、サーバーサイドを経ずにクライアントから直接 API コールを行う方式（Privacy-first）。

### 3. Template Management (Refactored)

- **Upload Flow:** ユーザーがローカルの `.pptx` を選択し、Drive へアップロードする機能を実装済み。
- **Constraint Satisfaction:** `drive.file` スコープ制約下でテンプレートを利用可能にするためのワークアラウンド（Upload-to-Own）が正常に動作。

### 4. Generative Engine (Core Logic)

- **Chat Interface:** Gemini へのメッセージ送信とレスポンス表示。
- **Function Calling:** Gemini が `update_manifest` ツールを介してスライド構成（JSON state）を操作するロジック。
- **Sync Engine:** 内部状態 (`useGeneratorStore`) と Google Slides (`batchUpdate` API) の同期処理。
  - テキスト置換機能 (`replaceAllText`)。
  - スライド複製機能 (`duplicateObject`)。

---

## 2. 実装の不足点・課題 (Limitations & Gaps)

実用レベルのアプリケーションとしては、以下の点が顕著に不足しています。

### A. テンプレート構造への "盲目性" (Blindness)

- **課題:** AI (Gemini) は、アップロードされたテンプレートの中に**実際にどんなレイアウトが含まれているか**を知りません。
- **現状:** AI は `layout_title`, `layout_bullet` といった一般的な名前を推測で出力しているだけです。
- **影響:** テンプレート内に存在しない LayoutID を指定して API エラーになる、または期待と異なるレイアウトが適用される可能性が高いです。

### B. スライド同期の脆弱性 (Fragile Sync)

- **課題:** `useGeneratorStore.ts` 内のスライドと ID のマッピングが「配列のインデックス順」に依存しています。
- **現状:**
  ```typescript
  // Slides are mapped purely by index
  const objectId = existingSlide ? existingSlide.objectId : ...
  ```
- **影響:** もしユーザーが Google Slides 側でスライドを削除したり並び替えたりすると、アプリ側の状態とズレが生じ、誤ったスライドを上書きするリスクがあります。

### C. プレースホルダーの未定義

- **課題:** AI は「どこを書き換えればいいか」を知りません。
- **現状:** `{{TITLE}}` のようなマーカーを使っているのか、既存のテキストを検索して置換するのか、明確な契約がありません。現在は `replaceAllText` で文字列一致による置換を試みていますが、テンプレート側にどの文字列が入っているか AI は知りません。

### D. エラーハンドリングとリカバリ

- **課題:** 同期処理 (`batchUpdate`) が失敗した場合のロールバック処理がありません。
- **現状:** API エラーが発生すると、アプリ上の状態は "Syncing..." から戻らないか、中途半端な状態で停止します。
- **影響:** ユーザーはページをリロードして最初からやり直す必要があります。

### E. セッション永続化の欠如

- **課題:** ブラウザをリロードすると、チャット履歴と生成中のマニフェスト状態がすべて消えます。
- **現状:** `localStorage` への状態保存が実装されていません（API Key 除く）。

---

## 3. 結論と提言

現在の実装は **「技術的な接続確認 (Connectivity PoC)」** の段階にあります。「認証を通して API を叩き、スライドを操作できること」は証明されましたが、「ユーザーが意図したプレゼンテーションを作成できること」には至っていません。

**最優先事項:**
ドキュメント `docs/Future_Roadmap.md` で提案した **"Template Package System"** の実装を急ぐ必要があります。
特に、「テンプレート定義ファイル (.json) を読み込み、AI にレイアウトとプレースホルダー情報を与える」機能がなければ、実用的な品質のスライド生成は不可能です。
