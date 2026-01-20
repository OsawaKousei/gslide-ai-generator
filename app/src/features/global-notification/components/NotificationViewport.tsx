import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import type { ToastPosition } from '../types';

const viewportVariants = cva(
  'fixed z-[100] flex max-h-screen w-full p-4 transition-all duration-300 ease-in-out pointer-events-none md:max-w-[420px]',
  {
    variants: {
      position: {
        default:
          'top-0 right-0 flex-col-reverse sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col',
        'top-left': 'top-0 left-0 flex-col-reverse',
        'top-right': 'top-0 right-0 flex-col-reverse',
        'bottom-left': 'bottom-0 left-0 flex-col',
        'bottom-right': 'bottom-0 right-0 flex-col',
      },
    },
    defaultVariants: {
      position: 'default',
    },
  }
);

type Props = {
  readonly children: ReactNode;
  readonly position?: ToastPosition;
};

export const NotificationViewport = ({ children, position }: Props) => {
  return (
    <div className={cn(viewportVariants({ position: position ?? 'default' }))}>
      {children}
    </div>
  );
};
