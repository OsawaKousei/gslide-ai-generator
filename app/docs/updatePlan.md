## **変更計画書: エントリーポイント新設と構成変更**

### **1. アーキテクチャ設計方針**

既存のコードベース（特にロジック部分）への侵襲を最小限に抑えるため、以下の戦略を採用します。

1.  **Layout (L3) による責務の分離:**
    - ヘッダー（全画面共通）を含むための `MainLayout` を新設します。
    - 既存の `MainPage.tsx` は、「特定機能の統合ページ」として位置づけ直し、ルート直下から `/editor` などのパス配下へ移動させます。

2.  **Widget (L2) の抽出と新設:**
    - **AuthHeaderWidget:** 既存の画面から「Googleログイン」「API Key設定」の機能を切り出し、独立した Widget として定義します。
    - **ModeAssignmentWidget:** 新しいエントリーポイントで「3つのモード」を選択するための Widget を feature として定義します。
    - **TemplateSelectWidget:** チャット入力欄の上に追加する「テンプレートアップロード」機能を Widget 化します。

3.  **Routing (Glue Code) の変更:**
    - AppRoutes.tsx を書き換え、URL と Layout/Widget のマッピングを再定義します。

---

### **2. 具体的な実装ステップ**

以下の4フェーズで実施することを推奨します。

#### **Phase 1: 共通ヘッダー機能の Widget 化 (Refactoring)**

既存の `ConfigWidget` や他のコンポーネントに含まれている認証・設定ロジックをリファクタリングします。

- **アクション:**
  - `src/features/auth/widgets/AuthHeaderWidget.tsx` を作成。
  - 現在 `generator` 内やサイドバーなどで管理されている認証（Google Login）と設定（Gemini API Key）の UI/ロジックをこの Widget に移設します。
  - `useAuthStore` は既存のものを利用するため、ロジックの大きな変更は不要です。
- **副作用:**
  - 既存画面から認証UIが消失するため、一時的に既存レイアウトが機能不足になります（Phase 3で解消）。

#### **Phase 2: 新規エントリーポイント (Home) の作成**

新しいトップページを作成します。新しい feature ドメインとして `home` を切り出します。

- **アクション:**
  - `src/features/home/` ディレクトリを作成。
  - `src/features/home/widgets/ModeSelectorWidget.tsx` を作成。
    - 3つのボタン（0から作成、テンプレートから作成、テンプレート作成）を配置。
    - クリック時に適切な URL へ遷移させる単純な責務を持たせます。
- **ディレクトリ構造:**
  ```text
  src/features/home/
    ├── widgets/
    │   └── ModeSelectorWidget.tsx (L2)
    └── components/
        └── ModeCard.tsx (L1)
  ```

#### **Phase 3: スライド生成機能の改修 (Generator Update)**

既存のチャット画面を「テンプレート利用モード」専用に特化させます。

- **アクション:**
  - `src/features/generator/widgets/TemplateUploaderWidget.tsx` を新規作成。
    - ご要望通り、`ChatWidget` の上部に配置するための専用 Widget です。
    - ファイルのアップロードと解析（ID抽出）を担当します。
  - **既存ページ (`MainPage.tsx`) の修正:**
    - `TemplateUploaderWidget` を `ChatWidget` の直上にレイアウト配置します。
    - ヘッダー部分（認証・設定）は Layout 側に委譲するため、`MainPage` からは削除します。

#### **Phase 4: ルーティングとレイアウトの統合 (Integration)**

最後に、これらを `routes` と `layout` で結合します。

- **アクション:**
  - `src/components/layouts/MainLayout.tsx` (L3) を新設。
    - 上部に `AuthHeaderWidget` を配置し、下部に `<Outlet />` を置くレイアウトです。
  - AppRoutes.tsx の定義を変更。
    - `/` : `MainLayout` > `ModeSelectorWidget`
    - `/create/template` : `MainLayout` > `MainPage` (既存機能改修版)
    - `/create/scratch` : (Future)
    - `/create/new-template` : (Future)

---

### **3. リスク評価と副作用の見積もり**

| 項目          | 影響度 | 詳細                                                                                                                | 対策                                                                                                                                                       |
| :------------ | :----- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E2Eテスト** | High   | `src/test/e2e/chat-flow.spec.ts` などのシナリオが失敗します。エントリーポイントがチャット画面ではなくなるためです。 | テストシナリオの「前提条件（Setup）」を変更し、トップページから遷移するステップを追加するか、テスト開始URLを `/create/template` に変更する必要があります。 |
| **State管理** | Medium | モード切替時に `useGeneratorStore` の状態（過去の対話履歴や設定）が残っていると不整合が起きる可能性があります。     | エントリーポイント（`/`）に戻った際、またはモード選択時に Store を `reset()` するロジックを `ModeSelectorWidget` に組み込む必要があります。                |
| **既存UI**    | Low    | `ConfigWidget` から認証機能を抜く際、依存関係を整理しないとビルドエラーになる可能性があります。                     | `auth` feature と `generator` feature の境界を明確にし、認証は `auth` features の責任範囲として完結させます。                                              |

### **4. 今後のロードマップへの影響**

この変更は **「Vite-Based CSR Framework Guideline」** および **「Widget-Oriented React Guideline」** に完全に準拠しています。
Feature (機能) ごとのディレクトリ分割が維持され、Layout と Widget の役割分担が明確になるため、将来的に「0からスライド作成」モードを追加する際も、単に AppRoutes.tsx に新しいルート定義と Widget を追加するだけで済み、他の機能に影響を与えません。

**推奨する次のアクション:**
まず **Phase 1 (共通ヘッダー機能の Widget 化)** から着手し、認証周りのコンポーネントを分離・独立させることから始めるのが最も低リスクです。
