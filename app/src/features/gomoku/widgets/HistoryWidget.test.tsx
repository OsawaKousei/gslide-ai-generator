import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useGomokuStore } from '../stores/useGomokuStore';
import { HistoryWidget } from './HistoryWidget';
import { PLAYER, type MoveRecord } from '../types';
import { createEmptyBoard } from '../utils/board-utils';

// Store をモック
vi.mock('../stores/useGomokuStore');

describe('HistoryWidget', () => {
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('履歴が空の場合、"No moves yet"と表示する', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    expect(screen.getByText('No moves yet')).toBeInTheDocument();
  });

  it('履歴がある場合、手の一覧を表示する', () => {
    const history: MoveRecord[] = [
      { turn: 1, player: PLAYER.BLACK, coordinate: { x: 7, y: 7 } },
      { turn: 2, player: PLAYER.WHITE, coordinate: { x: 8, y: 8 } },
      { turn: 3, player: PLAYER.BLACK, coordinate: { x: 9, y: 9 } },
    ];

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.WHITE,
        winner: null,
        history,
        historyIndex: 2,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    // 複数の "Black" が存在するため、座標で確認
    expect(screen.getByText(/1\./)).toBeInTheDocument();
    expect(screen.getByText(/\(8, 8\)/)).toBeInTheDocument(); // 0-based -> 1-based

    expect(screen.getByText(/2\./)).toBeInTheDocument();
    expect(screen.getByText(/White/)).toBeInTheDocument();
    expect(screen.getByText(/\(9, 9\)/)).toBeInTheDocument();

    expect(screen.getByText(/3\./)).toBeInTheDocument();
    expect(screen.getByText(/\(10, 10\)/)).toBeInTheDocument();
  });

  it('履歴がない場合、Undo/Redoボタンはdisabled', () => {
    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history: [],
        historyIndex: -1,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    const redoButton = screen.getByRole('button', { name: /redo/i });

    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('履歴の最後にいる場合、Undoは有効、Redoは無効', () => {
    const history: MoveRecord[] = [
      { turn: 1, player: PLAYER.BLACK, coordinate: { x: 7, y: 7 } },
      { turn: 2, player: PLAYER.WHITE, coordinate: { x: 8, y: 8 } },
    ];

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history,
        historyIndex: 1,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    const redoButton = screen.getByRole('button', { name: /redo/i });

    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('履歴の途中にいる場合、Undo/Redo両方が有効', () => {
    const history: MoveRecord[] = [
      { turn: 1, player: PLAYER.BLACK, coordinate: { x: 7, y: 7 } },
      { turn: 2, player: PLAYER.WHITE, coordinate: { x: 8, y: 8 } },
      { turn: 3, player: PLAYER.BLACK, coordinate: { x: 9, y: 9 } },
    ];

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.WHITE,
        winner: null,
        history,
        historyIndex: 1,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    const redoButton = screen.getByRole('button', { name: /redo/i });

    expect(undoButton).not.toBeDisabled();
    expect(redoButton).not.toBeDisabled();
  });

  it('Undoボタンをクリックするとundoアクションが発火する', async () => {
    const user = userEvent.setup();
    const history: MoveRecord[] = [
      { turn: 1, player: PLAYER.BLACK, coordinate: { x: 7, y: 7 } },
    ];

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.WHITE,
        winner: null,
        history,
        historyIndex: 0,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    await user.click(undoButton);

    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it('Redoボタンをクリックするとredoアクションが発火する', async () => {
    const user = userEvent.setup();
    const history: MoveRecord[] = [
      { turn: 1, player: PLAYER.BLACK, coordinate: { x: 7, y: 7 } },
      { turn: 2, player: PLAYER.WHITE, coordinate: { x: 8, y: 8 } },
    ];

    vi.mocked(useGomokuStore).mockImplementation((selector) =>
      selector({
        board: createEmptyBoard(),
        currentPlayer: PLAYER.BLACK,
        winner: null,
        history,
        historyIndex: 0,
        initializeGame: vi.fn(),
        placeStone: vi.fn(),
        undo: mockUndo,
        redo: mockRedo,
      }),
    );

    render(<HistoryWidget />);

    const redoButton = screen.getByRole('button', { name: /redo/i });
    await user.click(redoButton);

    expect(mockRedo).toHaveBeenCalledTimes(1);
  });
});
