import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ToastMessage,
  ModalConfig,
} from '../types';

type NotificationState = {
  readonly toasts: readonly ToastMessage[];
  readonly activeModal: ModalConfig | null;
  readonly actions: {
    readonly showToast: (payload: Omit<ToastMessage, 'id'>) => void;
    readonly dismissToast: (id: string) => void;
    readonly openModal: (config: Omit<ModalConfig, 'id'>) => void;
    readonly closeModal: () => void;
  };
};

// --- Store Implementation ---

const useNotificationStore = create<NotificationState>((set, get) => ({
  toasts: [],
  activeModal: null,
  actions: {
    showToast: (payload) => {
      const id = uuidv4();
      const newToast: ToastMessage = { ...payload, id };

      set((state) => ({
        toasts: [...state.toasts, newToast],
      }));

      // 自動消去ロジック (副作用)
      if (payload.durationMs !== 0) {
        setTimeout(() => {
          get().actions.dismissToast(id);
        }, payload.durationMs ?? 5000);
      }
    },

    dismissToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    openModal: (config) => {
      set({ activeModal: { ...config, id: uuidv4() } });
    },

    closeModal: () => {
      set({ activeModal: null });
    },
  },
}));

// Selector Patternの強制
export const useNotificationActions = () =>
  useNotificationStore((s) => s.actions);
export const useToasts = () => useNotificationStore((s) => s.toasts);
export const useActiveModal = () => useNotificationStore((s) => s.activeModal);
