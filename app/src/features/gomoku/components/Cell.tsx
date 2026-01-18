import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { type CellState, PLAYER } from '../types';

const cellVariants = cva(
  'relative flex items-center justify-center w-full h-full border border-slate-500/30',
  {
    variants: {
      variant: {
        board: 'bg-[#e6c288]', // 木目調
      },
    },
    defaultVariants: {
      variant: 'board',
    },
  },
);

const stoneVariants = cva(
  'w-[80%] h-[80%] rounded-full shadow-sm transition-all duration-200',
  {
    variants: {
      color: {
        [PLAYER.BLACK]: 'bg-slate-900',
        [PLAYER.WHITE]: 'bg-slate-100 border border-slate-300',
        null: 'hidden',
      },
      isLast: {
        true: 'ring-2 ring-red-500 ring-offset-1',
        false: '',
      },
    },
    defaultVariants: {
      color: null,
      isLast: false,
    },
  },
);

type CellProps = {
  readonly x: number;
  readonly y: number;
  readonly value: CellState;
  readonly isLastMove: boolean;
  readonly onClick: (x: number, y: number) => void;
};

export const Cell = ({ x, y, value, isLastMove, onClick }: CellProps) => {
  return (
    <div
      className={cn(cellVariants({ variant: 'board' }))}
      onClick={() => onClick(x, y)}
      role="button"
      aria-label={`Cell ${x},${y}`}
    >
      <div
        className={cn(
          stoneVariants({
            color: value === null ? 'null' : value,
            isLast: isLastMove,
          }),
        )}
      />
    </div>
  );
};
