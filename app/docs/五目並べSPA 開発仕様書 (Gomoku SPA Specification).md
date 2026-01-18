# **五目並べSPA 開発仕様書 (Gomoku SPA Specification)**

## **1\. 概要 (Overview)**

本プロジェクトは、ローカル環境で完結する（スタンドアロン）五目並べアプリケーションである。  
外部APIを利用せず、クライアントサイドのロジックのみで対戦機能、勝敗判定、棋譜管理を実現する。  
本開発は BasicGuideline, Widget-Oriented React Guideline, Vite-Based CSR Guideline, Tailwind-Based Styling Guideline に厳格に準拠する。

## **2\. アーキテクチャ構成 (Architecture)**

### **2.1 技術スタック**

- **Framework:** Vite \+ React
- **Language:** TypeScript (Strict Mode)
- **State Management:** Zustand (Client State / Widget間通信)
- **Styling:** Tailwind CSS \+ shadcn/ui \+ Lucide React
- **Logic:** Pure Functions (Functional Style)

### **2.2 ディレクトリ構造 (Feature-Sliced)**

src/features/gomoku/ にドメインロジックを集約する。

Plaintext

src/  
├── app/  
│ └── App.tsx \# Entry Point & Layout Composition  
├── features/  
│ └── gomoku/  
│ ├── components/ \# \[L1\] Pure Views (BoardGrid, Stone, Cell, etc.)  
│ ├── widgets/ \# \[L2\] Connected Widgets  
│ │ ├── GameControlWidget.tsx \# 左: 新規対局設定  
│ │ ├── BoardWidget.tsx \# 中: 盤面操作  
│ │ └── HistoryWidget.tsx \# 右: 棋譜・Undo/Redo  
│ ├── stores/  
│ │ └── useGomokuStore.ts \# \[Logic\] ゲーム状態管理  
│ ├── utils/  
│ │ ├── win-logic.ts \# \[Logic\] 勝敗判定ロジック (Pure Function)  
│ │ └── board-utils.ts \# \[Logic\] 盤面生成・操作  
│ ├── types.ts \# Domain Types  
│ └── index.ts \# Public API  
└── components/  
 └── ui/ \# \[Shared L1\] shadcn/ui (Button, Dialog, etc.)

## **3\. データモデルと型定義 (Data Models)**

### **3.1 定数と型 (Types)**

enum は使用せず、Object-as-Enum パターンを採用する。

TypeScript

// src/features/gomoku/types.ts

export const PLAYER \= {  
 BLACK: 'black',  
 WHITE: 'white',  
} as const;  
export type Player \= (typeof PLAYER)\[keyof typeof PLAYER\];

export const CELL_STATE \= {  
 EMPTY: null,  
 BLACK: 'black',  
 WHITE: 'white',  
} as const;  
export type CellState \= Player | null;

// 盤面は 15x15 の2次元配列  
export type BoardState \= readonly (readonly CellState\[\])\[\];

// 座標  
export type Coordinate \= {  
 readonly x: number;  
 readonly y: number;  
};

// 棋譜記録  
export type MoveRecord \= {  
 readonly turn: number;  
 readonly player: Player;  
 readonly coordinate: Coordinate;  
};

## **4\. 状態管理 (State Management)**

Zustand を使用し、3つの Widget 間で状態を共有する。ロジックは Store の Actions 内、または utils/ の純粋関数に委譲する。

### **4.1 Store 設計 (useGomokuStore.ts)**

| State         | 型             | 説明                                |
| :------------ | :------------- | :---------------------------------- | ------------------------ |
| board         | BoardState     | 現在の盤面状態                      |
| currentPlayer | Player         | 次の手番プレイヤー                  |
| winner        | Player         | null                                | 勝者（決着時のみセット） |
| history       | MoveRecord\[\] | 棋譜リスト                          |
| historyIndex  | number         | 現在表示中のターン数（Undo/Redo用） |

### **4.2 Actions (Logic)**

- initializeGame(): 盤面をクリアし、先手を黒に設定。
- placeStone(x, y):
  1. バリデーション（範囲外、既に石がある、決着済みなら無視）。
  2. 盤面更新 (Immutable)。
  3. 勝敗判定 (checkWin 関数呼び出し)。
  4. 勝者がいれば winner セット、なければ currentPlayer 交代。
  5. history に手を追加。
- undo(): historyIndex をデクリメントし、盤面を過去の状態に再構築する。
- redo(): historyIndex をインクリメントし、盤面を復元する。

## **5\. UI/UX デザイン & Widget分割**

画面全体を3カラムのレイアウト (L3) とし、各責務を Widget (L2) に分割する。

### **5.1 全体レイアウト (Main Layout)**

Tailwind Grid を使用して配置する。

TypeScript

// src/app/App.tsx (イメージ)  
\<div className="grid h-screen grid-cols-12 gap-4 p-4 bg-background"\>  
 \<aside className="col-span-3"\>  
 \<GameControlWidget /\> {/\* 左: コントロール \*/}  
 \</aside\>  
 \<main className="col-span-6 flex items-center justify-center"\>  
 \<BoardWidget /\> {/\* 中: 盤面 \*/}  
 \</main\>  
 \<aside className="col-span-3"\>  
 \<HistoryWidget /\> {/\* 右: 棋譜・コマンド \*/}  
 \</aside\>  
\</div\>

### **5.2 左カラム: GameControlWidget**

- **責務:** ゲームの初期化、プレイヤー名表示（簡易）、現在の手番表示。
- **L1 Components:**
  - Card (shadcn): パネル枠。
  - Button (shadcn): 「新規対局」ボタン。
  - PlayerBadge: 現在の手番を示すインジケータ。

### **5.3 中央カラム: BoardWidget**

- **責務:** 盤面の描画、クリックイベントのハンドリング、勝利モーダルの表示。
- **処理フロー:**
  1. useGomokuStore から board と winner を Select。
  2. Cell クリック時、placeStone(x, y) Action を発火。
  3. winner が存在する場合、GameResultModal (L1) を表示。
- **L1 Components:**
  - GomokuBoard: 15x15のグリッドを描画（Tailwind grid-cols-15）。
  - Cell: 石、または空点を描画。cva で状態（黒、白、空、直前の手）を管理。
  - GameResultModal: Dialog (shadcn) を使用。

### **5.4 右カラム: HistoryWidget**

- **責務:** 棋譜のリスト表示、「待った（Undo）」「進む（Redo）」操作。
- **L1 Components:**
  - MoveList: スクロール可能なリストエリア。
  - ControlBar: Undo/Redo ボタン配置エリア。

## **6\. ロジック実装詳細 (Business Logic)**

### **6.1 勝敗判定 (utils/win-logic.ts)**

盤面全体を走査するのではなく、**「最後に打たれた石」を起点**に4方向（横、縦、右下がり、右上がり）をチェックする最適化アルゴリズムを採用する。

- **入力:** board, lastMoveCoordinate, player
- **出力:** boolean (勝敗が決したか)
- **実装方針:** BasicGuideline に従い、ループ構文 (for) ではなく、再帰または配列操作を用いた関数型アプローチ、あるいは可読性を優先した限定的なループ（Widget-Oriented Sec 9.3 に従い、複雑なreduceよりはfor-ofを許容する方針だが、探索ロジックはwhileが自然なため、局所的に許可するか、再帰関数とする）を検討する。
  - _注記:_ 今回は探索ロジックの可読性を鑑み、utils 内部に隠蔽された純粋関数内でのみ、方向ベクトルを用いた for ループの使用を例外的に許可する（または再帰で書く）。

## **7\. スタイリング (Styling)**

Tailwind-Based Styling Guideline に準拠する。

### **7.1 盤面と石の表現**

cva を活用して宣言的に記述する。

TypeScript

// features/gomoku/components/Cell.tsx (抜粋)  
const cellVariants \= cva(  
 'relative flex items-center justify-center w-full h-full border-slate-400', // Base logic  
 {  
 variants: {  
 type: {  
 board: 'bg-\[\#e6c288\]', // 木目調の色  
 }  
 }  
 }  
);

const stoneVariants \= cva(  
 'w-\[80%\] h-\[80%\] rounded-full shadow-sm transition-all duration-200',  
 {  
 variants: {  
 color: {  
 black: 'bg-slate-900 radial-gradient-black', // 黒石  
 white: 'bg-slate-100 border border-slate-300', // 白石  
 null: 'hidden',  
 },  
 isLast: {  
 true: 'ring-2 ring-red-500 ring-offset-1', // 直前の手強調  
 false: '',  
 }  
 }  
 }  
);

## **8\. テスト計画 (Testing Strategy)**

- **Unit Logic (vitest):**
  - win-logic.ts: 様々な配置パターン（端、飛び石、6連など）での判定精度テスト。
  - useGomokuStore: placeStone 後の状態遷移、Undo/Redo の整合性テスト。
- **Widget Integration (vitest \+ RTL):**
  - BoardWidget: クリックイベントで Action が呼ばれるか。勝利時にモーダルが開くか。
- **Visual (playwright \- optional):**
  - 盤面のレイアウト崩れがないか確認（今回は優先度低）。
