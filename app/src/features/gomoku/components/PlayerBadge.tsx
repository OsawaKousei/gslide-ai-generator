import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { type Player, PLAYER } from '../types';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      player: {
        [PLAYER.BLACK]: 'border-transparent bg-slate-900 text-slate-50',
        [PLAYER.WHITE]: 'border-slate-200 bg-white text-slate-900 border',
      },
    },
  },
);

type PlayerBadgeProps = {
  readonly player: Player;
  readonly className?: string;
};

export const PlayerBadge = ({ player, className }: PlayerBadgeProps) => {
  return (
    <div className={cn(badgeVariants({ player }), className)}>
      {player === PLAYER.BLACK ? 'Black' : 'White'}
    </div>
  );
};
