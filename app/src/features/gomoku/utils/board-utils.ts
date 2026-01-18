import { ok, err, type Result } from 'neverthrow';
import {
  type BoardState,
  CELL_STATE,
  type Coordinate,
  type Player,
} from '../types';

export const BOARD_SIZE = 15;

export const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => CELL_STATE.EMPTY),
  );

export const isValidCoordinate = (x: number, y: number): boolean =>
  x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

export const isCellEmpty = ({
  board,
  x,
  y,
}: {
  board: BoardState;
  x: number;
  y: number;
}): boolean => isValidCoordinate(x, y) && board[y]?.[x] === CELL_STATE.EMPTY;

export const placeStoneOnBoard = ({
  board,
  coordinate: { x, y },
  player,
}: {
  board: BoardState;
  coordinate: Coordinate;
  player: Player;
}): Result<BoardState, string> => {
  if (!isValidCoordinate(x, y)) {
    return err('Invalid coordinate');
  }
  if (board[y]?.[x] !== CELL_STATE.EMPTY) {
    return err('Cell is already occupied');
  }

  const newBoard = board.map((row, rowIndex) =>
    rowIndex === y
      ? row.map((cell, colIndex) => (colIndex === x ? player : cell))
      : row,
  );

  return ok(newBoard);
};
