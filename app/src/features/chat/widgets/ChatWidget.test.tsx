import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from './ChatWidget';
import { useChatStore } from '../stores/useChatStore';

// Mock dependencies
vi.mock('../stores/useChatStore', () => ({
  useChatStore: vi.fn(),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWidget', () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default store mock
    (useChatStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          messages: [
            { id: '1', role: 'user', content: 'Hello' },
            { id: '2', role: 'model', content: 'Hi there' },
          ],
          isLoading: false,
          error: null,
          actions: {
            sendMessage: mockSendMessage,
          },
        };
        if (selector) return selector(state);
        return state;
      },
    );

    // Setup localStorage
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue('fake-key');
    window.alert = vi.fn();
  });

  it('should render messages', () => {
    render(<ChatWidget />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('should handle send message', () => {
    const { container } = render(<ChatWidget />);

    const input = screen.getByPlaceholderText(
      'Describe the presentation you want...',
    );
    fireEvent.change(input, { target: { value: 'New request' } });

    const submitButton = container.querySelector('button[type="submit"]');

    expect(submitButton).not.toBeNull();
    if (submitButton) {
      fireEvent.click(submitButton);
      expect(mockSendMessage).toHaveBeenCalledWith('New request', 'fake-key');
    }
  });

  it('should alert if no api key', () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    render(<ChatWidget />);

    const input = screen.getByPlaceholderText(/Describe/);
    fireEvent.change(input, { target: { value: 'Test' } });

    const btns = screen.getAllByRole('button');
    const sendBtn = btns[btns.length - 1];
    if (sendBtn) {
      fireEvent.click(sendBtn); // Send button is last
    }

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Please set Gemini API Key'),
    );
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
