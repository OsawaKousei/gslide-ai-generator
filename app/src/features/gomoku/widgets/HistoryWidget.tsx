import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGomokuStore } from '../stores/useGomokuStore';
import { PLAYER } from '../types';
import { cn } from '@/lib/utils';

export const HistoryWidget = () => {
  const history = useGomokuStore((state) => state.history);
  const historyIndex = useGomokuStore((state) => state.historyIndex);
  const undo = useGomokuStore((state) => state.undo);
  const redo = useGomokuStore((state) => state.redo);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <Card className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">History</h2>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-2 rounded mb-4 border">
        {history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No moves yet
          </p>
        ) : (
          <ul className="space-y-1">
            {history.map((move, index) => (
              <li
                key={move.turn}
                className={cn(
                  'text-sm px-2 py-1 rounded flex justify-between items-center',
                  index === historyIndex
                    ? 'bg-slate-200 font-medium text-slate-900'
                    : 'text-slate-600',
                  index > historyIndex && 'opacity-40',
                )}
              >
                <span>
                  <span className="inline-block w-6 text-slate-400">
                    {move.turn}.
                  </span>
                  {move.player === PLAYER.BLACK ? 'Black' : 'White'}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  ({move.coordinate.x + 1}, {move.coordinate.y + 1})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={undo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={redo}
          disabled={!canRedo}
        >
          Redo
        </Button>
      </div>
    </Card>
  );
};
