import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  type BoardState,
  type MoveRecord,
  type Player,
  PLAYER,
} from '../types';
import { createEmptyBoard, placeStoneOnBoard } from '../utils/board-utils';
import { checkWin } from '../utils/win-logic';

type GomokuState = {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | null;
  history: readonly MoveRecord[];
  historyIndex: number; // 現在表示している履歴のインデックス (0-based, -1 means initial state)
};

type GomokuActions = {
  initializeGame: () => void;
  placeStone: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
};

// Helper for undo/rebuild
const rebuildBoard = (
  history: readonly MoveRecord[],
  targetIndex: number,
): BoardState => {
  return history.slice(0, targetIndex + 1).reduce((board, move) => {
    const res = placeStoneOnBoard({
      board,
      coordinate: move.coordinate,
      player: move.player,
    });
    return res.isOk() ? res.value : board;
  }, createEmptyBoard());
};

export const useGomokuStore = create<GomokuState & GomokuActions>()(
  devtools((set, get) => ({
    board: createEmptyBoard(),
    currentPlayer: PLAYER.BLACK,
    winner: null,
    history: [],
    historyIndex: -1,

    initializeGame: () => {
      set({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
      });
    },

    placeStone: (x, y) => {
      const { board, currentPlayer, winner, history, historyIndex } = get();

      // 決着済みなら何もしない
      if (winner) return;

      // 過去の履歴を見ている状態で新しい手を打つ場合、未来の履歴を削除する
      const currentHistory = history.slice(0, historyIndex + 1);

      // 盤面更新
      const result = placeStoneOnBoard({
        board,
        coordinate: { x, y },
        player: currentPlayer,
      });

      result.match(
        (newBoard) => {
          const newMove: MoveRecord = {
            turn: currentHistory.length + 1,
            player: currentPlayer,
            coordinate: { x, y },
          };

          const isWin = checkWin({
            board: newBoard,
            lastMove: { x, y },
            player: currentPlayer,
          });
          const nextPlayer =
            currentPlayer === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;

          set({
            board: newBoard,
            currentPlayer: isWin ? currentPlayer : nextPlayer,
            winner: isWin ? currentPlayer : null,
            history: [...currentHistory, newMove],
            historyIndex: historyIndex + 1,
          });
        },
        (error) => {
          console.warn(error);
        },
      );
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < 0) return;

      const newIndex = historyIndex - 1;
      const newBoard = rebuildBoard(history, newIndex);

      const nextPlayer =
        newIndex === -1
          ? PLAYER.BLACK
          : history[newIndex]?.player === PLAYER.BLACK
            ? PLAYER.WHITE
            : PLAYER.BLACK;

      set({
        board: newBoard,
        historyIndex: newIndex,
        currentPlayer: nextPlayer,
        winner: null,
      });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;

      const newIndex = historyIndex + 1;
      const move = history[newIndex];
      if (!move) return;

      const { board } = get();
      const result = placeStoneOnBoard({
        board,
        coordinate: move.coordinate,
        player: move.player,
      });

      if (result.isOk()) {
        const newBoard = result.value;
        const isWin = checkWin({
          board: newBoard,
          lastMove: move.coordinate,
          player: move.player,
        });
        const nextPlayer =
          move.player === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;

        set({
          board: newBoard,
          historyIndex: newIndex,
          currentPlayer: isWin ? move.player : nextPlayer,
          winner: isWin ? move.player : null,
        });
      }
    },
  })),
);
