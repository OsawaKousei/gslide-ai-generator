import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from './useChatStore';
import { useGeneratorStore } from '../../generator/stores/useGeneratorStore';
import { ok, err } from 'neverthrow';

// Mock dependencies
const { mockSendMessage } = vi.hoisted(() => ({
  mockSendMessage: vi.fn(),
}));

vi.mock('../utils/gemini-api', () => {
  return {
    sendMessage: mockSendMessage,
  };
});

// Mock randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid',
  },
});

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().actions.clearHistory();
    useGeneratorStore.getState().actions.setManifest({
      presentationId: 'pid',
      title: 'Test',
      slides: [],
    });
    mockSendMessage.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add user message and call AI service', async () => {
    // Setup mock response
    mockSendMessage.mockResolvedValue(
      ok({
        text: 'I parsed that.',
        functionCall: undefined,
      }),
    );

    await useChatStore.getState().actions.sendMessage('Hello', 'api-key');

    const { messages, isLoading } = useChatStore.getState();

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      id: 'test-uuid',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    });
    expect(messages[1].role).toBe('model');
    expect(messages[1].content).toBe('I parsed that.');
    expect(isLoading).toBe(false);
    expect(mockSendMessage).toHaveBeenCalledWith({
      apiKey: 'api-key',
      history: expect.any(Array),
      message: 'Hello',
      currentManifest: expect.anything(),
    });
  });

  it('should handle function call update_manifest', async () => {
    // Setup mock response with function call
    mockSendMessage.mockResolvedValue(
      ok({
        text: 'Updating slides.',
        functionCall: {
          action: 'update_manifest',
          payload: {
            title: 'New Title',
            slides: [
              {
                id: 'slide-1',
                templateId: 'layout_title',
                content: { title: 'First Slide' },
              },
            ],
          },
        },
      }),
    );

    await useChatStore.getState().actions.sendMessage('Make slides', 'api-key');

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[1].functionCall).toBeDefined();

    // Check generator store update
    const manifest = useGeneratorStore.getState().manifest;
    expect(manifest.title).toBe('New Title');
    expect(manifest.slides).toHaveLength(1);
    expect(manifest.slides[0].content.title).toBe('First Slide');
    expect(manifest.slides[0].status).toBe('pending');
  });

  it('should handle error from AI service', async () => {
    mockSendMessage.mockResolvedValue(err(new Error('AI Error')));

    await useChatStore.getState().actions.sendMessage('Fail', 'api-key');

    const { messages, error, isLoading } = useChatStore.getState();
    // Should have user message
    expect(messages).toHaveLength(1);
    expect(error).toEqual(new Error('AI Error'));
    expect(isLoading).toBe(false);
  });
});
