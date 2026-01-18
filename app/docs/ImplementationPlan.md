# 五目並べ SPA 実装計画書

## 1. 概要

本ドキュメントは、五目並べ SPA の基盤構築完了後の、アプリケーション実装フェーズにおけるタスクを定義する。
基盤担当者（ArchAndInfra）により、以下の環境が整備済みである。

- **実行環境:** Vite + React + TypeScript (Strict)
- **ビルド設定:** Feature-Sliced Design に基づく Chunk 分割
- **ルーティング:** `src/routes/AppRoutes.tsx` -> `src/features/gomoku/pages/GomokuPage.tsx`
- **環境変数:** `src/env.ts` による Zod 検証
- **ディレクトリ構造:** `src/features/gomoku/` 以下のスカフォールディング

## 2. 残存タスク一覧

### Phase 1: UI Components (L1) 実装

- [x] **Shared Components (`src/components/ui/`)**
  - shadcn/ui のコンポーネント（Button, Card, Dialog 等）が不足している場合、追加実装または調整を行う。
- **Feature Components (`src/features/gomoku/components/`)**
  - [x] `Cell.tsx`: 盤面のマス目。`cva` を用いて状態（黒、白、空、直前の手）をスタイリングする。
  - [x] `GomokuBoard.tsx`: 15x15 のグリッドレイアウト。
  - [x] `PlayerBadge.tsx`: 手番表示用バッジ。
  - [x] `GameResultModal.tsx`: 勝敗決定時のダイアログ。

### Phase 2: Domain Logic & State Management 実装

- **Utils (`src/features/gomoku/utils/`)**
  - [x] `win-logic.ts`: 勝敗判定ロジック。最後の石を起点とした 4 方向探索。
  - [x] `board-utils.ts`: 盤面生成、バリデーション等の純粋関数。
- **Store (`src/features/gomoku/stores/`)**
  - [x] `useGomokuStore.ts`: Zustand ストアの実装。
    - State: `board`, `currentPlayer`, `winner`, `history`, `historyIndex`
    - Actions: `initializeGame`, `placeStone`, `undo`, `redo`

### Phase 3: Widget Integration (L2) 実装

各 Widget を Store および L1 コンポーネントと接続する。

- [x] **`GameControlWidget.tsx`**
  - Store から `currentPlayer` を取得し表示。
  - 「New Game」ボタンで `initializeGame` を発火。
- [x] **`BoardWidget.tsx`**
  - Store から `board` を取得し `GomokuBoard` を描画。
  - クリックイベントで `placeStone` を発火。
  - `winner` が存在する場合、`GameResultModal` を表示。
- [x] **`HistoryWidget.tsx`**
  - Store から `history` を取得しリスト表示。
  - Undo/Redo ボタンの実装。

### Phase 4: Testing

- [x] **Unit Tests (`vitest`)**
  - [x] `win-logic.ts` の網羅的テスト（境界値、各種勝利パターン）。
  - [x] `useGomokuStore.ts` の状態遷移テスト。
  - [x] `board-utils.ts` のテスト。
- [x] **Integration Tests**
  - Widget のレンダリングとイベントハンドリングのテスト。

## 3. 注意事項

- **Strict Mode:** TypeScript の Strict Mode を維持すること。
- **Pure Functions:** ロジックは可能な限り純粋関数として実装し、`utils/` に配置すること。
- **Styling:** Tailwind CSS と `cva` を活用し、CSS ファイルへの直接記述は避けること。
