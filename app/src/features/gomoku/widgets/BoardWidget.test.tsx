import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useGomokuStore } from '../stores/useGomokuStore';
import { BoardWidget } from './BoardWidget';
import { PLAYER } from '../types';
import { createEmptyBoard } from '../utils/board-utils';

// Store をモック
vi.mock('../stores/useGomokuStore');

// L1 コンポーネントをモック（単体テストのため）
vi.mock('../components/GomokuBoard', () => ({
  GomokuBoard: ({
    onCellClick,
  }: {
    onCellClick: (x: number, y: number) => void;
  }) => (
    <div data-testid="gomoku-board" onClick={() => onCellClick(7, 7)}>
      Mocked Board
    </div>
  ),
}));

vi.mock('../components/GameResultModal', () => ({
  GameResultModal: ({
    winner,
    open,
    onRestart,
  }: {
    winner: string | null;
    open: boolean;
    onRestart: () => void;
  }) =>
    open ? (
      <div data-testid="game-result-modal">
        <p>Winner: {winner}</p>
        <button onClick={onRestart}>Play Again</button>
      </div>
    ) : null,
}));

describe('BoardWidget', () => {
  const mockPlaceStone = vi.fn();
  const mockInitializeGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('盤面を描画する', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: mockPlaceStone,
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<BoardWidget />);

    expect(screen.getByTestId('gomoku-board')).toBeInTheDocument();
  });

  it('セルクリック時にplaceStoneアクションが発火する', async () => {
    const user = userEvent.setup();

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: mockPlaceStone,
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<BoardWidget />);

    const board = screen.getByTestId('gomoku-board');
    await user.click(board);

    expect(mockPlaceStone).toHaveBeenCalledWith(7, 7);
  });

  it('勝者が存在しない場合、GameResultModalは表示されない', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: mockPlaceStone,
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<BoardWidget />);

    expect(screen.queryByTestId('game-result-modal')).not.toBeInTheDocument();
  });

  it('勝者が存在する場合、GameResultModalが表示される', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: PLAYER.BLACK,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: mockPlaceStone,
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<BoardWidget />);

    expect(screen.getByTestId('game-result-modal')).toBeInTheDocument();
    expect(screen.getByText(`Winner: ${PLAYER.BLACK}`)).toBeInTheDocument();
  });

  it('モーダルのPlay Againボタンクリック時にinitializeGameが発火する', async () => {
    const user = userEvent.setup();

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: PLAYER.BLACK,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: mockPlaceStone,
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<BoardWidget />);

    const playAgainButton = screen.getByRole('button', { name: /play again/i });
    await user.click(playAgainButton);

    expect(mockInitializeGame).toHaveBeenCalledTimes(1);
  });
});
