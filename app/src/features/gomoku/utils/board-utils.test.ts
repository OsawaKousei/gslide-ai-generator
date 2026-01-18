import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  isValidCoordinate,
  isCellEmpty,
  placeStoneOnBoard,
  BOARD_SIZE,
} from './board-utils';
import { CELL_STATE, PLAYER } from '../types';

describe('board-utils', () => {
  describe('createEmptyBoard', () => {
    it('should create a 15x15 board filled with empty cells', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      board.forEach((row) => {
        expect(row).toHaveLength(BOARD_SIZE);
        row.forEach((cell) => {
          expect(cell).toBe(CELL_STATE.EMPTY);
        });
      });
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(14, 14)).toBe(true);
      expect(isValidCoordinate(7, 7)).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(-1, 0)).toBe(false);
      expect(isValidCoordinate(0, -1)).toBe(false);
      expect(isValidCoordinate(15, 0)).toBe(false);
      expect(isValidCoordinate(0, 15)).toBe(false);
    });
  });

  describe('isCellEmpty', () => {
    it('should return true if cell is empty', () => {
      const board = createEmptyBoard();
      expect(isCellEmpty({ board, x: 0, y: 0 })).toBe(true);
    });

    it('should return false if cell is occupied', () => {
      const board = createEmptyBoard();
      const result = placeStoneOnBoard({
        board,
        coordinate: { x: 0, y: 0 },
        player: PLAYER.BLACK,
      });
      if (result.isErr()) throw result.error;

      expect(isCellEmpty({ board: result.value, x: 0, y: 0 })).toBe(false);
    });

    it('should return false for invalid coordinates', () => {
      const board = createEmptyBoard();
      expect(isCellEmpty({ board, x: -1, y: 0 })).toBe(false);
    });
  });

  describe('placeStoneOnBoard', () => {
    it('should place a stone on an empty cell', () => {
      const board = createEmptyBoard();
      const result = placeStoneOnBoard({
        board,
        coordinate: { x: 7, y: 7 },
        player: PLAYER.BLACK,
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value[7]?.[7]).toBe(PLAYER.BLACK);
        // Immutability check
        expect(result.value).not.toBe(board);
        expect(result.value[7]).not.toBe(board[7]);
        expect(result.value[0]).toBe(board[0]); // Unchanged row should be same reference
      }
    });

    it('should return error if coordinate is invalid', () => {
      const board = createEmptyBoard();
      const result = placeStoneOnBoard({
        board,
        coordinate: { x: -1, y: 0 },
        player: PLAYER.BLACK,
      });
      expect(result.isErr()).toBe(true);
    });

    it('should return error if cell is already occupied', () => {
      const board = createEmptyBoard();
      const result1 = placeStoneOnBoard({
        board,
        coordinate: { x: 0, y: 0 },
        player: PLAYER.BLACK,
      });
      if (result1.isErr()) throw result1.error;

      const result2 = placeStoneOnBoard({
        board: result1.value,
        coordinate: { x: 0, y: 0 },
        player: PLAYER.WHITE,
      });
      expect(result2.isErr()).toBe(true);
    });
  });
});
