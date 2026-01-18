import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Player, PLAYER } from '../types';

type GameResultModalProps = {
  readonly winner: Player | null;
  readonly open: boolean;
  readonly onRestart: () => void;
};

export const GameResultModal = ({
  winner,
  open,
  onRestart,
}: GameResultModalProps) => {
  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Game Over</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center">
          <p className="text-lg">
            Winner:{' '}
            <span className="font-bold">
              {winner === PLAYER.BLACK ? 'Black' : 'White'}
            </span>
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onRestart} className="w-full sm:w-auto">
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
