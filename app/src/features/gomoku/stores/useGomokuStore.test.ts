import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGomokuStore } from './useGomokuStore';
import { PLAYER, CELL_STATE } from '../types';

describe('useGomokuStore', () => {
  beforeEach(() => {
    useGomokuStore.getState().initializeGame();
  });

  it('should initialize with default state', () => {
    const state = useGomokuStore.getState();
    expect(state.currentPlayer).toBe(PLAYER.BLACK);
    expect(state.winner).toBeNull();
    expect(state.history).toHaveLength(0);
    expect(state.historyIndex).toBe(-1);
    // Check center is empty
    expect(state.board[7]?.[7]).toBe(CELL_STATE.EMPTY);
  });

  it('should place stone and switch player', () => {
    useGomokuStore.getState().placeStone(7, 7);

    const state = useGomokuStore.getState();
    expect(state.board[7]?.[7]).toBe(PLAYER.BLACK);
    expect(state.currentPlayer).toBe(PLAYER.WHITE);
    expect(state.history).toHaveLength(1);
    expect(state.historyIndex).toBe(0);
    expect(state.history[0]).toEqual({
      turn: 1,
      player: PLAYER.BLACK,
      coordinate: { x: 7, y: 7 },
    });
  });

  it('should not place stone on occupied cell', () => {
    const consoleSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    useGomokuStore.getState().placeStone(7, 7);
    useGomokuStore.getState().placeStone(7, 7); // Try placing again

    const state = useGomokuStore.getState();
    expect(state.board[7]?.[7]).toBe(PLAYER.BLACK); // Still Black
    expect(state.currentPlayer).toBe(PLAYER.WHITE); // Still White's turn
    expect(state.history).toHaveLength(1);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should detect win', () => {
    const store = useGomokuStore.getState();
    // Black wins horizontally
    store.placeStone(0, 0); // B
    store.placeStone(0, 1); // W
    store.placeStone(1, 0); // B
    store.placeStone(1, 1); // W
    store.placeStone(2, 0); // B
    store.placeStone(2, 1); // W
    store.placeStone(3, 0); // B
    store.placeStone(3, 1); // W
    store.placeStone(4, 0); // B wins

    const state = useGomokuStore.getState();
    expect(state.winner).toBe(PLAYER.BLACK);
    expect(state.currentPlayer).toBe(PLAYER.BLACK); // Winner stays current
  });

  it('should undo and redo', () => {
    const store = useGomokuStore.getState();
    store.placeStone(0, 0); // B
    store.placeStone(1, 0); // W

    // Undo White's move
    store.undo();
    let state = useGomokuStore.getState();
    expect(state.historyIndex).toBe(0);
    expect(state.board[0]?.[1]).toBe(CELL_STATE.EMPTY);
    expect(state.currentPlayer).toBe(PLAYER.WHITE);

    // Undo Black's move
    store.undo();
    state = useGomokuStore.getState();
    expect(state.historyIndex).toBe(-1);
    expect(state.board[0]?.[0]).toBe(CELL_STATE.EMPTY);
    expect(state.currentPlayer).toBe(PLAYER.BLACK);

    // Redo Black's move
    store.redo();
    state = useGomokuStore.getState();
    expect(state.historyIndex).toBe(0);
    expect(state.board[0]?.[0]).toBe(PLAYER.BLACK);
    expect(state.currentPlayer).toBe(PLAYER.WHITE);
  });

  it('should clear future history when placing stone after undo', () => {
    const store = useGomokuStore.getState();
    store.placeStone(0, 0); // B
    store.placeStone(1, 0); // W
    store.undo(); // Undo W

    // Place stone at different location
    store.placeStone(2, 0); // W (new move)

    const state = useGomokuStore.getState();
    expect(state.history).toHaveLength(2);
    expect(state.history[1]?.coordinate).toEqual({ x: 2, y: 0 });
    expect(state.historyIndex).toBe(1);
  });
});
