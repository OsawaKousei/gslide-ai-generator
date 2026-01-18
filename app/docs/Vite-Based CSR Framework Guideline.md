# **Vite-Based CSR Framework Guideline**

**Subtitle: Infrastructure & Runtime Standards for Scalable SPA**

## **1\. 概要 (Overview)**

本規約は、**BasicGuideline** および **Widget-Oriented React Guideline** を基盤とし、それらを物理的に動作させるための「実行環境（Runtime）」および「開発環境（Dev Environment）」の標準を定義します。

### **1.1 目的とスコープ**

- **Infrastructure as Code:** 開発環境から本番ビルドまでを Docker で統一し、「環境の差異」によるバグを根絶する。

- **Strict Runtime:** アプリケーションの起動時（Bootstrap）に、環境変数や依存関係の整合性を強制的に検証する。

- **Glue Code Management:** UIコンポーネント（Widget/Layout）を URL と紐付ける「ルーティング層」の記述ルールを厳格化する。

## **2\. 技術スタック (Tech Stack)**

インフラおよびビルドパイプラインを構成するツール群です。UIライブラリやテストの「書き方」については _Widget-Oriented React Guideline_ に準拠します。

| Category         | Tool                  | Strategy / Policy                                                                      |
| :--------------- | :-------------------- | :------------------------------------------------------------------------------------- |
| **Bundler**      | Vite                  | 高速なHMRとRollupベースの堅牢なビルド。                                                |
| **Router**       | React Router (v6+)    | 宣言的なクライアントサイド・ルーティング。                                             |
| **Test Runner**  | Playwright / Vitest   | CI/CDおよびコンテナ内での実行基盤として使用（※テスト記述法はWidgetガイドライン参照）。 |
| **Infra (Dev)**  | Docker Compose        | ローカル開発環境の統一と HMR の維持。                                                  |
| **Infra (Prod)** | Static Hosting \+ CDN | コンテナランタイムを必要としない静的配信。                                             |

## **3\. ディレクトリ構造と境界 (Structure & Boundaries)**

Widget指向アーキテクチャをアプリケーションとして成立させるための、ルートレベルの構造です 。各ディレクトリは明確な「参照権限」を持ちます。

Plaintext

root/  
├── .docker/ \# Docker関連設定  
├── src/  
│ ├── app/ \# \[Bootstrap\] エントリーポイント & Global Providers  
│ ├── assets/ \# \[Assets\] 静的アセット (Global CSS, Images)  
│ ├── features/ \# \[Domain\] 機能ドメイン (Widget-Oriented準拠)  
│ ├── routes/ \# \[Glue Code\] URLとWidgetの紐付け  
│ ├── shared/ \# \[Utils\] 共有ユーティリティ  
│ ├── env.ts \# \[Config\] 環境変数定義 (Zod)  
│ └── vite-env.d.ts \# \[Types\] 環境変数の型拡張  
└── vite.config.ts \# Vite設定

### **3.1 src/app/ (Bootstrap Layer)**

アプリケーションの初期化と、全域に影響するプロバイダーの連鎖（Chain）を管理します。  
ルール: 以下の順序で Provider を配置することを標準とします。

1. **Error Boundary:** 最上位でのクラッシュ防止。
2. **Suspense:** コード分割読み込み中のグローバルローディング 。

3. **State Providers:** QueryClientProvider (Server State) 等。
4. **Router Provider:** ルーティングの有効化。

### **3.2 src/routes/ (Integration Layer)**

URL と UI (L3 Layout \+ L2 Widgets) を紐付ける唯一の場所です 12。  
Widget-Oriented アーキテクチャを崩壊させないため、import 制限を最も厳格に適用します。

- **責務:**
  - URLパラメータの取得 (useParams) 。

  - L3 Layout および L2 Widget の配置 。

  - React.lazy による動的インポート 。

- **禁止事項 (Strict Ban):**
  - ❌ **L1 Components への直接アクセス:** features/\*/components を import してはならない（カプセル化違反）。
  - ❌ **Store/Logic の直接実行:** データフェッチや状態更新ロジックを書いてはならない（L2 Widget に委譲せよ）。

  - ❌ **DOMの直接記述:** \<div\> 等のマークアップは禁止。

## **4\. 環境設定と型安全性 (Configuration & Type Safety)**

### **4.1 Vite Config & Chunk Strategy**

ビルド設定は vite.config.ts に集約します。大規模開発に耐えうるよう、機能単位でのチャンク分割（Code Splitting）設定を推奨します。

TypeScript

import { defineConfig } from 'vite';  
import react from '@vitejs/plugin-react';  
import path from 'path';

export default defineConfig({  
 plugins: \[react()\],  
 resolve: {  
 alias: { '@': path.resolve(\_\_dirname, './src') }, // \[cite: 29\]  
 },  
 server: {  
 host: true, // Docker対応 \[cite: 33\]  
 watch: { usePolling: true }, // Docker Volume対応 \[cite: 33\]  
 },  
 build: {  
 rollupOptions: {  
 output: {  
 // FeatureごとにChunkを分割し、キャッシュ効率を高める  
 manualChunks: (id) \=\> {  
 if (id.includes('node_modules')) return 'vendor';  
 if (id.includes('src/features/')) {  
 // src/features/xxx/... \-\> xxx  
 const featureName \= id.split('src/features/')\[1\].split('/')\[0\];  
 return \`feature-${featureName}\`;  
 }  
 },  
 },  
 },  
 },  
});

### **4.2 環境変数の型安全性 (Strict Env)**

import.meta.env への直接アクセスを禁止し、Zod で検証されたオブジェクト経由でのみアクセスを許可します 。さらに、TypeScript の型拡張を行い、IDE での補完を効かせます。

**A. 検証ロジック (src/env.ts)**

TypeScript

import { z } from 'zod';

export const envSchema \= z.object({  
 VITE_API_BASE_URL: z.string().url(),  
 VITE_ENABLE_ANALYTICS: z.string().transform((v) \=\> v \=== 'true').optional(),  
});

// 検証失敗時はアプリ起動時に即座にエラー (Fail Fast) \[cite: 40\]  
export const env \= envSchema.parse(import.meta.env);

**B. 型定義拡張 (src/vite-env.d.ts)**

TypeScript

/// \<reference types="vite/client" /\>  
import { z } from 'zod';  
import { envSchema } from './env';

type Env \= z.infer\<typeof envSchema\>;

// import.meta.env で補完が効くように拡張  
interface ImportMetaEnv extends Env {}

interface ImportMeta {  
 readonly env: ImportMetaEnv;  
}

## **5\. コンテナ化戦略 (Containerization)**

BasicGuideline の「ツールによる自動強制」を実現するため、Docker を必須とします。

### **5.1 Development (docker-compose.yml)**

ローカル環境の差異を排除し、HMR (Hot Module Replacement) を維持します。

YAML

services:  
 app:  
 build:  
 context: .  
 dockerfile: Dockerfile.dev  
 ports:  
 \- "5173:5173"  
 volumes:  
 \- ./:/app  
 \- \[cite_start\]/app/node_modules \# ホストのnode_modules混入防止 \[cite: 59\]  
 environment:  
 \- \[cite_start\]CHOKIDAR_USEPOLLING=true \# ファイル変更検知の強制 \[cite: 59\]

### **5.2 Production Build (Dockerfile.prod)**

デプロイ環境に依存しない「再現可能なビルド」を保証します。成果物は dist/ ディレクトリのみであり、ランタイムとしての Node.js は含みません。

Dockerfile

\# Builder Stage  
FROM node:20\-slim AS builder  
WORKDIR /app  
COPY package.json package-lock.json ./  
RUN npm ci  
COPY . .  
\# 型チェックとビルドを実行 (BasicGuideline遵守)  
RUN npm run build

## **6\. デプロイとインフラ戦略 (Deployment Strategy)**

### **6.1 SPA Fallback (Rewrite Rules)**

クライアントサイドルーター (react-router-dom) を機能させるため、ホスティングサーバー側で 「存在しないパスへのアクセスはすべて index.html を返す」 設定が必須です 。

### **設定要件**

1. **Status Code:** 存在しないファイルへのアクセスに対し 200 OK を返すこと（404ではない）。
2. **Target:** /index.html を返すこと。

### **代表的なサービスでの設定例**

**A. AWS CloudFront \+ S3 (Custom Error Response)**

- Error Code 403/404 に対し、Path /index.html を Response Code 200 で返すように設定する。

**B. Nginx**

Nginx

location / {  
 try_files $uri $uri/ /index.html;  
}

**C. Firebase Hosting / Vercel / Netlify**

- 設定ファイル (firebase.json, vercel.json 等) に rewrites ルールを記述する。

JSON

"rewrites": \[ { "source": "\*\*", "destination": "/index.html" } \]

### **6.2 アセット管理**

- **Images:** public/ ではなく src/assets/ に配置し、import することでハッシュ化（キャッシュバスター）の恩恵を受けます。

- **SVG:** Reactコンポーネントとして扱うため、vite-plugin-svgr 等の使用を推奨します。

## **7\. 品質保証 (Quality Assurance)**

CI/CD パイプラインにおいて、以下の順序で検証を実行し、BasicGuideline および Widget-Oriented Guideline の違反を機械的に阻止します 。

3. **Dependency Check:** (推奨) eslint-plugin-import 等を用い、features 間の循環参照や、shared への不適切な依存を検出する。
4. **Type Check:** tsc \--noEmit (型整合性の確認)。

5. **Lint:** eslint (BasicGuideline の構文禁止ルールの検知)。

6. **Unit/Widget Test:** vitest run (ロジック・結合テスト)。

7. **E2E/Visual Test:** playwright test (外観・イベントのVRT)。

8. **Build:** npm run build (最終アーティファクト生成)。
