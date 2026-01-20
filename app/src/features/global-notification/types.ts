export const NOTIFICATION_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;
export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const TOAST_POSITION = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
} as const;
export type ToastPosition = (typeof TOAST_POSITION)[keyof typeof TOAST_POSITION];

export type ToastMessage = {
  readonly id: string;
  readonly type: NotificationType;
  readonly position?: ToastPosition;
  readonly title?: string;
  readonly message: string;
  readonly durationMs?: number;
};

export type ModalConfig = {
  readonly id: string;
  readonly title: string;
  readonly content: React.ReactNode;
  readonly type: NotificationType;
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly confirmText?: string;
  readonly cancelText?: string;
};
