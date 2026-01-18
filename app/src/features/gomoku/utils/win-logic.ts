import { type BoardState, type Coordinate, type Player } from '../types';
import { isValidCoordinate } from './board-utils';

// 方向ベクトル: [dx, dy]
// 横, 縦, 右下がり, 右上がり
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;

export const checkWin = ({
  board,
  lastMove,
  player,
}: {
  board: BoardState;
  lastMove: Coordinate;
  player: Player;
}): boolean => {
  const { x, y } = lastMove;

  // 各方向についてチェック
  return DIRECTIONS.some(([dx, dy]) => {
    // 正方向の連続数
    const countPositive = countConsecutive({
      board,
      start: { x, y },
      direction: { dx, dy },
      player,
    });
    // 負方向の連続数
    const countNegative = countConsecutive({
      board,
      start: { x, y },
      direction: { dx: -dx, dy: -dy },
      player,
    });

    // 自分自身を含めて5つ以上なら勝ち
    return countPositive + countNegative + 1 >= 5;
  });
};

const countConsecutive = ({
  board,
  start,
  direction,
  player,
}: {
  board: BoardState;
  start: Coordinate;
  direction: { dx: number; dy: number };
  player: Player;
}): number => {
  const nextX = start.x + direction.dx;
  const nextY = start.y + direction.dy;

  if (!isValidCoordinate(nextX, nextY) || board[nextY]?.[nextX] !== player) {
    return 0;
  }

  return (
    1 +
    countConsecutive({
      board,
      start: { x: nextX, y: nextY },
      direction,
      player,
    })
  );
};
