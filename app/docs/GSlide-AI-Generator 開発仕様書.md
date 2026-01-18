# **GSlide-AI-Generator PoC 開発仕様書**

## **1\. 概要 (Overview)**

本プロジェクトは、生成AI (Gemini) と Google Slides API を連携させ、ユーザーとの対話（Chat）を通じてプレゼンテーションスライドを自動構築・編集する Single Page Application (SPA) の PoC である。

「Googleスライドをマスター（テンプレート）とする」設計思想に基づき、AIはデザインを行わず、ユーザーの意図を汲み取って最適なテンプレートを選択し、プレースホルダへコンテンツを注入（Injection）する「スライド・アーキテクト」として振る舞う。

本開発は、**Widget-Oriented React Guideline**, **Vite-Based CSR Framework Guideline**, **Tailwind-Based Styling Guideline** に厳格に準拠する。

### **1.1 目的とスコープ**

- **Conversational Creation:** 一方的な生成ではなく、チャットUIを通じて「スライド3の具体例をもっと増やして」といった自然言語による修正指示を実現する。
- **Live Preview:** 画面の左半分を Google スライドのプレビュー領域とし、チャットでの合意が即座に視覚的に反映される体験を提供する。
- **Secure & Serverless:** ユーザーのブラウザ内で完結する BYOK (Bring Your Own Key) モデルを採用し、プライバシーとセキュリティを担保する。

## **2\. アーキテクチャ構成 (Architecture)**

**Vite-Based CSR Framework Guideline** に基づき、Docker 化された Vite \+ React 環境で構築する。

### **2.1 技術スタック**

| Category             | Tool                           | Strategy / Policy                                         |
| :------------------- | :----------------------------- | :-------------------------------------------------------- |
| **Framework**        | Vite \+ React                  | 高速なHMRと堅牢なビルド。                                 |
| **Language**         | TypeScript (Strict Mode)       | 型安全性確保。                                            |
| **State Management** | Zustand                        | Chat History, Slide Manifest, Auth State の管理。         |
| **Styling**          | Tailwind CSS \+ shadcn/ui      | Grid/Flex レイアウトによる画面分割とコンポーネント実装。  |
| **Auth**             | Google Identity Services (GIS) | トークンモデルによるクライアントサイド認証。              |
| **AI**               | Google Gemini API              | @google/generative-ai SDK を使用。                        |
| **Backend**          | None (Serverless)              | ブラウザから直接 Google APIs (Drive, Slides) を操作する。 |

### **2.2 ディレクトリ構造 (Feature-Sliced)**

src/features/ 配下にドメインを分割し、UIロジックを集約する。

Plaintext

src/  
├── app/  
│ └── App.tsx \# Entry Point & Grid Layout Definition  
├── features/  
│ ├── auth/ \# \[Domain\] Google OAuth認証  
│ ├── chat/ \# \[Domain\] AIとの対話・プロンプト管理  
│ │ ├── components/ \# ChatBubble, InputArea  
│ │ ├── stores/ \# useChatStore (履歴管理)  
│ │ └── utils/ \# System Prompt Builder  
│ └── generator/ \# \[Domain\] スライド操作・API連携  
│ ├── components/ \# PreviewFrame (iframe)  
│ ├── widgets/ \# \[L2\] Connected Widgets  
│ │ ├── PreviewWidget.tsx \# 左: スライドプレビュー  
│ │ ├── ConfigWidget.tsx \# 右上: 設定・Auth・テンプレート選択  
│ │ └── ChatWidget.tsx \# 右下(中央): メイン対話エリア  
│ ├── stores/  
│ │ └── useGeneratorStore.ts \# Manifest管理・Sync状態  
│ └── utils/  
│ ├── slide-api.ts \# Google Slides API (BatchUpdate)  
│ └── drive-api.ts \# Drive API (Copy)  
└── components/ui/ \# \[Shared L1\] shadcn/ui

## **3\. データモデル (Data Models)**

### **3.1 スライド構成データ (Manifest)**

AIはチャットの文脈に基づき、以下のJSON構造を生成・更新する。

TypeScript

// src/features/generator/types.ts

export type TemplateId \= 'layout_title' | 'layout_bullet' | 'layout_comparison' | string;

export type SlideNode \= {  
 id: string; // UUID (React key用)  
 objectId?: string; // Google Slides上のPage ID (同期後に付与)  
 templateId: TemplateId;  
 content: {  
 title: string;  
 body?: string\[\];  
 \[key: string\]: any;  
 };  
 status: 'pending' | 'synced' | 'dirty'; // 同期状態管理  
};

export type PresentationManifest \= {  
 presentationId: string | null; // Google Slides ID  
 title: string;  
 slides: SlideNode\[\];  
};

### **3.2 チャットデータ**

TypeScript

// src/features/chat/types.ts

export type ChatMessage \= {  
 id: string;  
 role: 'user' | 'model' | 'system';  
 content: string; // 表示用テキスト  
 functionCall?: { // スライド操作命令  
 action: 'create_slides' | 'update_slide' | 'change_template';  
 payload: any;  
 };  
 timestamp: number;  
};

## **4\. 状態管理 (State Management)**

Zustand を使用し、**「チャットの指示」→「マニフェスト更新」→「API同期」** のデータフローを一方向で管理する。

### **4.1 Store 設計**

- **useAuthStore**: Google OAuth トークン、ユーザー情報 (email for authuser)。
- **useGeneratorStore**:
  - manifest: 現在のスライド構成データ。
  - isSyncing: API通信中フラグ。
  - syncToSlides(): manifest の差分（dirty なスライド）を検知し、Google Slides API を叩いて synced にする Action。
- **useChatStore**:
  - messages: 会話履歴。
  - sendMessage(text): Gemini API へ送信。Function Calling (Structured Output) を利用し、テキスト回答と同時に manifest 操作用JSONを受け取る。

## **5\. UI/UX デザイン (Layout Strategy)**

要望に基づき、画面を左右に分割した **Split View Layout** を採用する。

### **5.1 グリッドレイアウト定義 (src/app/App.tsx)**

Tailwind CSS の Grid/Flex を使用し、レスポンシブかつ固定比率のレイアウトを組む。

TypeScript

\<div className="flex h-screen w-screen bg-gray-50"\>  
 {/\* \[Left Pane\] Preview Area (50% width) \*/}  
 \<section className="w-1/2 h-full border-r border-gray-200 bg-white"\>  
 \<PreviewWidget /\>  
 \</section\>

{/\* \[Right Pane\] Control & Interaction (50% width) \*/}  
 \<section className="flex flex-col w-1/2 h-full"\>

    {/\* \[Right Top\] Config Area (Fixed Height) \*/}
    \<header className="h-auto p-4 border-b border-gray-200 bg-white/50 backdrop-blur"\>
      \<ConfigWidget /\>
    \</header\>

    {/\* \[Right Center/Bottom\] Chat Area (Flex Grow) \*/}
    \<main className="flex-1 overflow-hidden relative"\>
      \<ChatWidget /\>
    \</main\>

\</section\>  
\</div\>

### **5.2 各ウィジェットの仕様**

#### **A. PreviewWidget (Left)**

- **構成:** Google Slides を表示する iframe コンテナ。
- **ロジック:**
  - useGeneratorStore の presentationId が存在する場合のみ表示。
  - **Auth User対応:** useAuthStore から取得した email を使い、src URLに \&authuser={email} を付与してアカウント不一致エラーを防ぐ。
  - **Live Update:** isSyncing が false に戻ったタイミング（同期完了）で、非同期に iframe をリロードするか、Slides API の getThumbnail で画像のみを更新する（モード切替可能にする）。

#### **B. ConfigWidget (Right Top)**

- **構成:** アプリケーションの動作設定パネル。
- **要素:**
  - **Auth Status:** Google ログイン/ログアウトボタン。ログイン中はアイコンとEmailを表示。
  - **API Key:** Gemini API キー入力欄（マスキング表示、LocalStorage保存トグル）。
  - **Template Source:** 使用するマスタースライドの選択（Drive Picker 連携、または ID 直接入力）。

#### **C. ChatWidget (Right Center)**

- **構成:** AI との対話タイムライン。
- **機能:**
  - **Message List:** ユーザーと AI の吹き出し。AI がスライド生成を行った場合は、「✅ スライドを 3 枚生成しました」といったシステムログ的な表示も行う。
  - **Input Area:** テキスト入力 \+ 送信ボタン。「資料を添付」ボタン（テキスト抽出用）も配置。
  - **Context Aware:** 現在のスライド構成（Manifest）を常に System Prompt の一部として送信し、AI が「何枚目のスライドの話をしているか」を理解できるようにする。

## **6\. ロジック実装詳細 (Logic)**

### **6.1 チャット駆動生成フロー**

1. **User:** 「この議事録テキストから、要点をまとめたスライドを作って。テンプレートは『箇条書き』を使って。」
2. **LLM (Gemini):**
   - テキスト応答: 「承知しました。3枚のスライド構成案を作成します。」
   - Function Call: update_manifest({ slides: \[...\] })
3. **App Logic:**
   - useGeneratorStore が Function Call を受信し、manifest State を更新。
   - Google Drive API: 指定テンプレートをコピーして新規プレゼンテーション作成。
   - Google Slides API: batchUpdate でテキスト置換を実行。
4. **Preview:** 左画面に生成されたスライドが表示される。
5. **User:** 「2枚目のタイトルを『課題』に変更して。」
6. **LLM & App:** コンテキストを理解し、2枚目のデータのみを修正して API を再実行。

### **6.2 Google API 操作の最適化**

- **drive-api.ts**:
  - files.copy: テンプレートをコピーする際、fields="id,name" を指定して軽量化。
- **slide-api.ts**:
  - batchUpdate: 全スライドを一気に生成するのではなく、ユーザーが修正したスライドの objectId に紐づくリクエストのみを送信する差分更新ロジックを実装する。

## **7\. セキュリティ (Security)**

- **OAuth Scope:** https://www.googleapis.com/auth/drive.file を使用し、このアプリが作成したファイルのみにアクセス権を限定する。
- **Token Handling:** アクセストークンはメモリ内（Zustand Store）でのみ保持し、永続化しない。リロード時はサイレントリフレッシュを試みるか、再ログインを促す。
- **API Key:** Gemini APIキーはユーザーのブラウザ（LocalStorage）に保存するが、使用時はサーバーを経由せず直接 Google のエンドポイントへ送信する。

## **8\. 開発ステップ (Milestones)**

1. **Setup (Day 1):** Vite \+ React プロジェクト作成、shadcn/ui 導入、レイアウト実装。
2. **Auth Integration (Day 2):** Google Identity Services 導入、トークン取得、ConfigWidget 実装。
3. **API Logic (Day 3):** Drive API (Copy) と Slides API (Text Replace) の疎通確認。
4. **Chat & AI (Day 4-5):** Gemini API 連携、Prompt Engineering、Manifest 構造の定義。
5. **Integration (Day 6):** チャットから API をキックし、左画面にプレビューを出す一連のフロー結合。
