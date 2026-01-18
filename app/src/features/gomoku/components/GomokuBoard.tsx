import type { BoardState, Coordinate } from '../types';
import { Cell } from './Cell';

type GomokuBoardProps = {
  readonly board: BoardState;
  readonly lastMove: Coordinate | null;
  readonly onCellClick: (x: number, y: number) => void;
};

export const GomokuBoard = ({
  board,
  lastMove,
  onCellClick,
}: GomokuBoardProps) => {
  return (
    <div
      className="grid gap-[1px] bg-slate-500 border-2 border-slate-800 shadow-lg"
      style={{
        gridTemplateColumns: 'repeat(15, 1fr)',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: '600px',
      }}
    >
      {board.map((row, y) =>
        row.map((cellState, x) => (
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            value={cellState}
            isLastMove={lastMove?.x === x && lastMove?.y === y}
            onClick={onCellClick}
          />
        )),
      )}
    </div>
  );
};
