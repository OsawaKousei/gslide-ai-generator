import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ToastMessage } from '../types';
import { X } from 'lucide-react';

// CVAによるスタイル定義
const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      type: {
        success: 'border-green-500 bg-green-50 text-green-900',
        error: 'border-destructive bg-destructive text-destructive-foreground',
        info: 'border-blue-500 bg-blue-50 text-blue-900',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
);

type Props = {
  readonly toast: ToastMessage;
  readonly onDismiss: (id: string) => void;
};

export const NotificationToast = ({ toast, onDismiss }: Props) => {
  return (
    <div className={cn(toastVariants({ type: toast.type }))}>
      <div className="grid gap-1">
        {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
