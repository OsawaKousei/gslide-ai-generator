import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ModalConfig } from '../types';

type Props = {
  readonly config: ModalConfig;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

export const NotificationModal = ({ config, onClose, onConfirm }: Props) => {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          {/* DialogDescription is recommended for accessibility even if visually redundant if there's no description text, 
              but config.content can be arbitrary node. We wrap it. */}
          <div className="py-4 text-sm text-muted-foreground">
            {config.content}
          </div>
        </DialogHeader>
        <DialogFooter>
          {config.onCancel && (
            <Button variant="outline" onClick={config.onCancel}>
              {config.cancelText ?? 'Cancel'}
            </Button>
          )}
          <Button onClick={onConfirm}>
            {config.confirmText ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
