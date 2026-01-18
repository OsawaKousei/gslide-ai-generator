# Implementation Plan: GSlide-AI-Generator

本計画書は、Google Slides 生成 SPA の開発プロセスを定義します。
**Vite-Based CSR Framework Guideline**, **Widget-Oriented React Guideline**, **BasicGuideline** に準拠し、品質と保守性を担保します。

## Phase 1: Scaffolding & Infrastructure (ArchAndInfra) - **Completed**

プロジェクトの基盤を整備し、不要なコードを削除します。

- [x] **Cleanup:** `features/gomoku` および関連するルーティング、依存関係の削除。
- [x] **Directory Structure:** 機能分割（Feature-Sliced）に基づくディレクトリ作成 (`auth`, `chat`, `generator`)。
- [x] **Runtime Config:** `src/env.ts` の更新（Google Client ID 用の枠組み作成など）。
- [x] **Dependencies:** 必要なライブラリのインストール (`zustand`, `@google/generative-ai`, `neverthrow`, `lucide-react` 等)。
- [x] **Layout Skeleton:** `src/app/App.tsx`, `src/routes/AppRoutes.tsx` の初期実装（Split View Layout）。

**Artifacts:**

- Clean workspace
- Initial `src/app/App.tsx` with layout
- Updated `package.json`

## Phase 2: Authentication (Feature Implementation) - **Completed**

Google Identity Services (GIS) を用いた認証機能を実装します。

- [x] **Auth Store:** `useAuthStore` の実装 (Zustand)。ユーザー情報とトークンの管理。
- [x] **Auth Utility:** Google ログインボタンの統合と認証フローの実装。
- [x] **Widget:** `ConfigWidget` 内への認証ステータス・ログインボタンの配置。
- [x] **Test:**
  - `useAuthStore` の単体テスト (Vitest)。
  - ログイン状態による UI 切り替えのコンポーネントテスト。

## Phase 3: Google API Integration (Feature Implementation) - **Completed**

Google Drive & Slides API との通信層を確立します。

- [x] **API Utilities:**
  - `drive-api.ts`: テンプレートのコピー機能。
  - `slide-api.ts`: プレゼンテーションの更新機能 (batchUpdate)。
- [x] **Store:** `useGeneratorStore` の実装。Manifest 管理と同期ロジック。
- [x] **Components:** `PreviewWidget` (iframe) の実装。
- [x] **Test:**
  - 各 API Utility のモックを使用した単体テスト。
  - `useGeneratorStore` の状態遷移テスト。

## Phase 4: Chat & AI Logic (Feature Implementation) - **Completed**

Gemini API との連携およびチャット UI を実装します。

- [x] **Chat Store:** `useChatStore` の実装。履歴管理。
- [x] **AI Service:** `@google/generative-ai` を用いた Gemini 呼び出しと Function Calling のハンドリング。
- [x] **Widgets:** `ChatWidget` の実装 (Message List, Input Area)。
- [x] **System Prompt:** スライド生成・修正に特化したプロンプト設計。
- [x] **Test:**
  - AI レスポンス (Function Call) のパース処理の単体テスト。
  - チャット UI のインタラクションテスト。

## Phase 5: Integration & E2E (QA)

全モジュールを統合し、実動作を確認します。

- [ ] **Integration:** `App.tsx` での各 Widget の結合確認。
- [ ] **E2E Test:** Playwright を使用した、「チャットで指示 -> スライド生成 -> プレビュー更新」の一連のフロー確認。
- [ ] **Refine:** エッジケース（API エラー、トークン切れ）のハンドリング改善。

---

## 開発ルール (Guidelines Reminder)

- **Strict Runtime:** `src/env.ts` で定義されていない環境変数は使用しない。
- **Widgets:** UI は `features/*/widgets` に集約し、`src/routes` や `src/app` にロジック漏れさせない。
- **Styling:** Tailwind CSS + shadcn/ui を使用。
- **No Class/Enum:** 手続き型・関数型アプローチを徹底する。
