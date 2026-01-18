export const PLAYER = {
  BLACK: 'black',
  WHITE: 'white',
} as const;
export type Player = (typeof PLAYER)[keyof typeof PLAYER];

export const CELL_STATE = {
  EMPTY: null,
  BLACK: 'black',
  WHITE: 'white',
} as const;
export type CellState = Player | null;

// 盤面は 15x15 の2次元配列
export type BoardState = ReadonlyArray<readonly CellState[]>;

// 座標
export type Coordinate = {
  readonly x: number;
  readonly y: number;
};

// 棋譜記録
export type MoveRecord = {
  readonly turn: number;
  readonly player: Player;
  readonly coordinate: Coordinate;
};
