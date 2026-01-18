import { useGomokuStore } from '../stores/useGomokuStore';
import { GomokuBoard } from '../components/GomokuBoard';
import { GameResultModal } from '../components/GameResultModal';

export const BoardWidget = () => {
  const board = useGomokuStore((state) => state.board);
  const history = useGomokuStore((state) => state.history);
  const historyIndex = useGomokuStore((state) => state.historyIndex);
  const winner = useGomokuStore((state) => state.winner);
  const placeStone = useGomokuStore((state) => state.placeStone);
  const initializeGame = useGomokuStore((state) => state.initializeGame);

  const lastMove =
    historyIndex >= 0 && history[historyIndex]
      ? history[historyIndex].coordinate
      : null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <GomokuBoard board={board} lastMove={lastMove} onCellClick={placeStone} />
      <GameResultModal
        winner={winner}
        open={winner !== null}
        onRestart={initializeGame}
      />
    </div>
  );
};
