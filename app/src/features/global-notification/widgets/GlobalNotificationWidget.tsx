import {
  useToasts,
  useActiveModal,
  useNotificationActions,
} from '../stores/notification-store';
import { NotificationToast } from '../components/NotificationToast';
import { NotificationModal } from '../components/NotificationModal';
import { NotificationViewport } from '../components/NotificationViewport';
import { TOAST_POSITION } from '../types';

export const GlobalNotificationWidget = () => {
  const toasts = useToasts();
  const activeModal = useActiveModal();
  const { dismissToast, closeModal } = useNotificationActions();

  // Positioning groups
  const positions = [undefined, ...Object.values(TOAST_POSITION)];

  return (
    <>
      {/* Toast Regions */}
      {positions.map((pos) => {
        const filteredToasts = toasts.filter((t) => t.position === pos);
        if (filteredToasts.length === 0) return null;

        return (
          <NotificationViewport key={pos ?? 'default'} position={pos}>
            {filteredToasts.map((toast) => (
              <NotificationToast
                key={toast.id}
                toast={toast}
                onDismiss={dismissToast}
              />
            ))}
          </NotificationViewport>
        );
      })}

      {/* Modal Region */}
      {activeModal && (
        <NotificationModal
          config={activeModal}
          onClose={closeModal}
          onConfirm={() => {
            activeModal.onConfirm?.();
            closeModal();
          }}
        />
      )}
    </>
  );
};
