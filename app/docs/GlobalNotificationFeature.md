# Global Notification Feature

## 1. 概要 (Overview)

`global-notification` 機能は、アプリケーション全体で統一された「トースト通知」および「モーダルダイアログ」を表示するための機能です。
**Widget-Oriented Architecture** に従い、機能ドメインとしてカプセル化されています。

### 特徴
- **Centralized State:** Zustand を使用して通知の状態を一元管理しており、どこからでもアクセス可能です。
- **Type Safety:** TypeScript による厳格な型定義がされており、誤った使い方がコンパイル時に検知されます。
- **Widget-Oriented:** `GlobalNotificationWidget` を配置するだけで機能し、ロジックと見た目が完全に分離されています。

## 2. セットアップ (Setup)

アプリケーションのルート (`src/app/App.tsx` など) に `GlobalNotificationWidget` を1回だけ配置します。
これにより、トーストやモーダルの表示領域 (Viewport) が確保されます。

```tsx
// src/app/App.tsx
import { GlobalNotificationWidget } from '@/features/global-notification';

export const App = () => {
  return (
    <>
      {/* ... other providers / routes ... */}
      <GlobalNotificationWidget />
    </>
  );
};
```

## 3. 使用方法 (Usage)

通知を表示したいコンポーネント（任意のWidgetやHook内）から `useNotificationActions` フックを使用します。

### 3.1 トースト通知の表示 (Toast)

一時的なメッセージを表示します。デフォルトで5秒後に自動的に消えます。

```tsx
import { useNotificationActions } from '@/features/global-notification';

export const MyWidget = () => {
  const { showToast } = useNotificationActions();

  const handleSave = () => {
    // 処理...

    showToast({
      title: '保存完了',
      message: '設定を保存しました。',
      type: 'success',
      // durationMs: 3000, // オプション: 表示時間(ms)
    });
  };

  return <button onClick={handleSave}>保存</button>;
};
```

### 3.2 モーダルの表示 (Modal)

ユーザーの確認を求めるダイアログを表示します。

```tsx
import { useNotificationActions } from '@/features/global-notification';

export const DeleteButton = () => {
  const { openModal } = useNotificationActions();

  const handleDelete = () => {
    openModal({
      title: '削除の確認',
      content: '本当にこのアイテムを削除してもよろしいですか？この操作は取り消せません。',
      type: 'warning',
      confirmText: '削除する',
      cancelText: 'キャンセル',
      onConfirm: () => {
        console.log('削除実行');
        // 実際の削除ロジック...
      },
      // onCancel はデフォルトでモーダルを閉じる処理が含まれます
    });
  };

  return <button onClick={handleDelete}>削除</button>;
};
```

## 4. API Reference

### 4.1 Hooks

#### `useNotificationActions()`
アクションを実行するための関数群を返します。

- **`showToast(payload: ToastPayload): void`**
- **`openModal(config: ModalPayload): void`**
- **`dismissToast(id: string): void`**
- **`closeModal(): void`**

### 4.2 Types

**`NotificationType`**
通知のスタイルを指定します。
- `'success'`: 成功 (緑)
- `'error'`: エラー (赤)
- `'info'`: 情報 (青) - デフォルト
- `'warning'`: 警告 (黄)

**`ToastPayload` (Omit<ToastMessage, 'id'>)**
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `NotificationType` | ✅ | 通知の種類 |
| `message` | `string` | ✅ | 本文メッセージ |
| `title` | `string` | ❌ | タイトル（太字で表示） |
| `durationMs` | `number` | ❌ | 表示時間(ms)。`0`で自動消去無効。デフォルトはStore実装または呼び出し側で指定。 |

**`ModalPayload` (Omit<ModalConfig, 'id'>)**
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | ✅ | ダイアログのタイトル |
| `content` | `ReactNode` | ✅ | 本文。文字列またはReact要素を渡せます。 |
| `type` | `NotificationType` | ✅ | アイコンやボタン色などに影響する場合あり。 |
| `onConfirm` | `() => void` | ❌ | 確認ボタン押下時のコールバック。 |
| `onCancel` | `() => void` | ❌ | キャンセルボタン押下時のコールバック。 |
| `confirmText` | `string` | ❌ | 確認ボタンのラベル (Default: 'Confirm') |
| `cancelText` | `string` | ❌ | キャンセルボタンのラベル (Default: 'Cancel') |

## 5. ディレクトリ構造

```
src/features/global-notification/
├── components/           # [L1] Pure Views (外部使用禁止)
│   ├── NotificationModal.tsx
│   ├── NotificationToast.tsx
│   └── NotificationViewport.tsx
├── stores/               # [State] Zustand Store
│   └── notification-store.ts
├── widgets/              # [L2] Widget (App.tsxで使用)
│   └── GlobalNotificationWidget.tsx
├── index.ts              # Entry Point (Public API)
└── types.ts              # Type Definitions
```
