import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGomokuStore } from '../stores/useGomokuStore';
import { PlayerBadge } from '../components/PlayerBadge';

export const GameControlWidget = () => {
  const currentPlayer = useGomokuStore((state) => state.currentPlayer);
  const initializeGame = useGomokuStore((state) => state.initializeGame);

  return (
    <Card className="p-4 h-full">
      <h2 className="text-xl font-bold mb-4">Game Control</h2>
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg border flex flex-col items-center gap-2">
          <span className="text-sm text-slate-500 font-medium">
            Current Player
          </span>
          <PlayerBadge player={currentPlayer} className="text-lg px-4 py-1" />
        </div>
        <Button onClick={initializeGame} className="w-full">
          New Game
        </Button>
      </div>
    </Card>
  );
};
