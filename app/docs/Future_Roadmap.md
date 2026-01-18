# GSlide-AI-Generator Future Development Roadmap

本ドキュメントは、**GSlide-AI-Generator** を PoC (概念実証) レベルから、実運用可能なプロダクションレベルのアプリケーションへ昇華させるための開発計画書です。
特に、テンプレートシステムの柔軟性を最大化し、LLM の推論精度を動的に向上させるアーキテクチャへの移行を主軸とします。

## 1. コンセプト: "Template Package" System

現在の手動アップロード方式を拡張し、**テンプレートファイル (.pptx) と定義ファイル (.json) をセットで管理する仕組み**を導入します。これにより、AI は「どのようなスライドレイアウトが利用可能か」を正確に認識した上で構成案を作成できるようになります。

### 1.1 テンプレート構造の刷新 (Template Package)

ユーザーは単一の `.pptx` ではなく、以下の構成を持つフォルダ（または ZIP アーカイブ）を読み込ませます。

```text
/MyCorporateTemplate
  ├── master.pptx          # デザイン定義済みのマスターファイル
  └── template.config.json # レイアウト定義とメタデータ
```

**`template.config.json` の仕様例:**

```json
{
  "name": "Corporate Pitch Deck",
  "description": "Standard template for business proposals.",
  "layouts": [
    {
      "id": "title_slide",
      "name": "タイトルスライド",
      "description": "プレゼンテーションの表紙。タイトルとサブタイトルのみを含む。",
      "placeholders": [
        { "key": "{{TITLE}}", "description": "Main presentation title" },
        { "key": "{{SUBTITLE}}", "description": "Presenter name or date" }
      ]
    },
    {
      "id": "two_column_comparison",
      "name": "2カラム比較",
      "description": "左右に対比項目を並べるスライド。Before/Afterや競合比較に使用。",
      "placeholders": [
        { "key": "{{HEADER_L}}", "description": "Left column header" },
        { "key": "{{BODY_L}}", "description": "Left column content" },
        { "key": "{{HEADER_R}}", "description": "Right column header" },
        { "key": "{{BODY_R}}", "description": "Right column content" }
      ]
    }
  ]
}
```

### 1.2 動的プロンプト構築 (Dynamic Prompt Injection)

現在の `gemini-api.ts` にハードコードされている `SYSTEM_INSTRUCTION` を廃止し、読み込んだ `template.config.json` に基づいてシステムプロンプトを動的に生成します。

**期待される効果:**

- **ハルシネーションの抑制:** 存在しないレイアウト（例: "Timeline Slide"）を AI が勝手に指定するのを防ぎます。
- **表現力の向上:** テンプレート特有の複雑なレイアウト（3カラム、図解用スペース付き等）を AI が「道具」として認識し、適切に使いこなせるようになります。

---

## 2. 機能拡張ロードマップ

実用化に向けて必要な機能をフェーズ分けして実装します。

### Phase 2.1: Advanced Template Engine (最優先)

- [ ] **Folder Import UI:** `<input type="file" webkitdirectory />` または Drag & Drop によるフォルダ読み込みの実装。
- [ ] **Metdata Parser:** クライアントサイドで JSON を解析し、Store (`useGeneratorStore`) にレイアウト定義を格納。
- [ ] **Dynamic Prompting:** `useChatStore` が `GeneratorStore` のレイアウト定義を参照し、Gemini へのリクエストに「使用可能なツール（レイアウト）」としてコンテキストを含めるロジックの実装。

### Phase 2.2: Generative Content Enrichment

テキスト置換だけでなく、より豊かな表現をサポートします。

- [ ] **Image Replacement:**
  - テンプレート内に `{{IMAGE_PLACEHOLDER}}` のような図形を配置。
  - AI が画像生成プロンプトを出力し、(Imagen 3 等で) 画像を生成してスライドに挿入する機能。
- [ ] **Chart Update:**
  - テンプレート内の既存グラフ（Sheets Chart）のデータを、Google Slides API 経由で書き換える機能。
  - 例: AI が JSON データとして `{"revenue": [100, 200, 300]}` を出力し、それをグラフに適用。

### Phase 2.3: UX/UI Improvements

- [ ] **Slide Preview:**
  - 生成前に、AI が作成した構成案（JSON）を簡易的なカード形式でプレビュー表示し、ユーザーが手動で順序入れ替えやテキスト修正を行える画面。
- [ ] **Fine-grained Progress:**
  - 「スライド 3/10 を生成中...」といった詳細な進捗表示 (Server-Sent Events またはポーリングの最適化)。
- [ ] **History & Resume:**
  - 過去に生成したプレゼンテーションの履歴管理（ローカルストレージまたは Drive 上の特定フォルダ参照）。

### Phase 2.4: Enterprise Features

- [ ] **Variable Management:**
  - 会社名、日付、発表者名などの「共通変数」をフォーム入力し、全スライドに一括適用する機能。
- [ ] **Style Enforcer:**
  - 生成されたテキストが長すぎて枠からはみ出る場合の自動フォントサイズ調整ロジック（Text Fitting）。
- [ ] **Quota & Error Handling:**
  - Google API の Rate Limit (特に Write Request) に対する指数バックオフ (Exponential Backoff) 再試行ロジックの強化。

---

## 3. 実装に向けた技術的課題と解決案

### A. トークン制限への対応

テンプレート定義が肥大化すると、システムプロンプトが長くなりすぎ、入力トークンを圧迫します。

- **対策:** 定義ファイルには「最低限の説明」のみ記述する制約を設ける。または、スライド枚数が多い場合はコンテキストウィンドウの広いモデル (Gemini 2.5 Pro) を明示的に使用する。

### B. アップロード戦略の最適化

毎回マスタースライドをコピーする現在の方式は安全ですが、完了まで時間がかかります。

- **対策:** `drive.file` スコープ内で作成したファイルをアプリ側で「Cached Templates」として管理し、2回目以降はアップロードをスキップしてコピーのみを行うロジックを導入する（ファイルのハッシュ値で同一性を検証）。

### C. ユーザーガイドラインの整備

このシステムは「テンプレート作成者」への依存度が高まります。

- **対策:** 「AIに最適化されたテンプレートの作り方ガイド」をドキュメントとして提供する。（プレースホルダーの命名規則や、グループ化の回避など）

## 4. 次のアクション

まずは **Phase 2.1: Advanced Template Engine** の設計・実装に着手することを推奨します。これにより、アプリケーションのコアバリューである「生成されるスライドの質」が劇的に向上します。
