import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useGomokuStore } from '../stores/useGomokuStore';
import { GameControlWidget } from './GameControlWidget';
import { PLAYER } from '../types';

// Store をモック
vi.mock('../stores/useGomokuStore');

describe('GameControlWidget', () => {
  const mockInitializeGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('現在の手番プレイヤーを表示する（黒）', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: [],
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<GameControlWidget />);

    expect(screen.getByText('Current Player')).toBeInTheDocument();
    expect(screen.getByText('Black')).toBeInTheDocument();
  });

  it('現在の手番プレイヤーを表示する（白）', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: [],
        currentPlayer: PLAYER.WHITE,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<GameControlWidget />);

    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('New GameボタンをクリックするとinitializeGameアクションが発火する', async () => {
    const user = userEvent.setup();

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: [],
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: mockInitializeGame,
        placeStone: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
      }),
    );

    render(<GameControlWidget />);

    const newGameButton = screen.getByRole('button', { name: /new game/i });
    await user.click(newGameButton);

    expect(mockInitializeGame).toHaveBeenCalledTimes(1);
  });
});
