import { describe, it, expect } from 'vitest';
import { checkWin } from './win-logic';
import { createEmptyBoard, placeStoneOnBoard } from './board-utils';
import { PLAYER, type BoardState } from '../types';

describe('win-logic', () => {
  const placeStones = ({
    board,
    coords,
    player,
  }: {
    board: BoardState;
    coords: Array<[number, number]>;
    player: typeof PLAYER.BLACK | typeof PLAYER.WHITE;
  }): BoardState => {
    return coords.reduce((currentBoard, [x, y]) => {
      const result = placeStoneOnBoard({
        board: currentBoard,
        coordinate: { x, y },
        player,
      });
      return result.isOk() ? result.value : currentBoard;
    }, board);
  };

  it('should detect horizontal win', () => {
    let board = createEmptyBoard();
    // 0,0 to 4,0
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
      ],
      player: PLAYER.BLACK,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 4, y: 0 },
        player: PLAYER.BLACK,
      }),
    ).toBe(true);
  });

  it('should detect vertical win', () => {
    let board = createEmptyBoard();
    // 0,0 to 0,4
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      player: PLAYER.WHITE,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 0, y: 4 },
        player: PLAYER.WHITE,
      }),
    ).toBe(true);
  });

  it('should detect diagonal (down-right) win', () => {
    let board = createEmptyBoard();
    // 0,0 to 4,4
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ],
      player: PLAYER.BLACK,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 4, y: 4 },
        player: PLAYER.BLACK,
      }),
    ).toBe(true);
  });

  it('should detect diagonal (up-right) win', () => {
    let board = createEmptyBoard();
    // 0,4 to 4,0
    board = placeStones({
      board,
      coords: [
        [0, 4],
        [1, 3],
        [2, 2],
        [3, 1],
        [4, 0],
      ],
      player: PLAYER.WHITE,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 4, y: 0 },
        player: PLAYER.WHITE,
      }),
    ).toBe(true);
  });

  it('should not detect win for 4 stones', () => {
    let board = createEmptyBoard();
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      player: PLAYER.BLACK,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 3, y: 0 },
        player: PLAYER.BLACK,
      }),
    ).toBe(false);
  });

  it('should detect win even if stones are placed in random order', () => {
    let board = createEmptyBoard();
    // 0,0, 2,0, 1,0, 4,0, 3,0
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [2, 0],
        [1, 0],
        [4, 0],
        [3, 0],
      ],
      player: PLAYER.BLACK,
    });

    expect(
      checkWin({
        board,
        lastMove: { x: 3, y: 0 }, // Any of them could be last, but logic checks around lastMove
        player: PLAYER.BLACK,
      }),
    ).toBe(true);
  });

  it('should detect win in the middle of a line', () => {
    let board = createEmptyBoard();
    // X X L X X (L is last move)
    board = placeStones({
      board,
      coords: [
        [0, 0],
        [1, 0],
        [3, 0],
        [4, 0],
      ],
      player: PLAYER.BLACK,
    });
    // Place middle stone last
    const result = placeStoneOnBoard({
      board,
      coordinate: { x: 2, y: 0 },
      player: PLAYER.BLACK,
    });
    if (result.isErr()) throw result.error;
    board = result.value;

    expect(
      checkWin({
        board,
        lastMove: { x: 2, y: 0 },
        player: PLAYER.BLACK,
      }),
    ).toBe(true);
  });
});
