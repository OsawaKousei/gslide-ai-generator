import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Content } from '@google/genai';
import { type ChatMessage, type ChatState } from '../types';
import { sendMessage } from '../utils/gemini-api';
import { useGeneratorStore } from '../../generator/stores/useGeneratorStore';
import type { SlideNode } from '../../generator/types';

type ChatActions = {
  readonly addMessage: (message: ChatMessage) => void;
  readonly sendMessage: (content: string, apiKey: string) => Promise<void>;
  readonly clearHistory: () => void;
};

type Store = ChatState & {
  readonly actions: ChatActions;
};

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const useChatStore = create<Store>()(
  devtools((set, get) => ({
    ...initialState,
    actions: {
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      clearHistory: () => set({ messages: [] }),

      sendMessage: async (content, apiKey) => {
        const { messages } = get();
        const { manifest, actions: generatorActions } =
          useGeneratorStore.getState();

        // 1. Add User Message
        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, userMessage],
          isLoading: true,
          error: null,
        }));

        try {
          // 2. Prepare History
          // Limit history to avoid token limits if necessary, but for now send all.
          // Convert internal ChatMessage to Gemini Content
          const history: Content[] = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role,
              parts: [{ text: m.content }], // Note: Function calls in history are complex, simplifying for now
            }));

          // 3. Call AI
          const result = await sendMessage({
            apiKey,
            history,
            message: content,
            currentManifest: manifest,
          });

          if (result.isErr()) {
            throw result.error;
          }

          const { text, functionCall } = result.value;

          // 4. Add Model Message
          const modelMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            content: text,
            ...(functionCall ? { functionCall } : {}),
            timestamp: Date.now(),
          };

          set((state) => ({
            messages: [...state.messages, modelMessage],
            isLoading: false,
          }));

          // 5. Execute Function Call
          if (functionCall && functionCall.action === 'update_manifest') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload = functionCall.payload as any;

            // Merge logic
            const newSlides = [...manifest.slides];
            const incomingSlides = (payload.slides || []) as Array<
              Partial<SlideNode>
            >;

            incomingSlides.forEach((incoming) => {
              const index = newSlides.findIndex((s) => s.id === incoming.id);
              if (index >= 0) {
                // Update
                newSlides[index] = {
                  ...newSlides[index],
                  ...incoming,
                  status: 'dirty', // Mark as dirty for sync
                  content: {
                    ...(newSlides[index]?.content || {}),
                    ...(incoming.content || {}),
                  },
                } as SlideNode;
              } else {
                // Append
                newSlides.push({
                  id: incoming.id || crypto.randomUUID(),
                  templateId: incoming.templateId || 'layout_title',
                  content: {
                    title: 'New Slide',
                    ...(incoming.content || {}),
                  },
                  status: 'pending',
                } as SlideNode);
              }
            });

            generatorActions.setManifest({
              ...manifest,
              title: payload.title || manifest.title,
              slides: newSlides,
            });

            // Trigger Sync
            await generatorActions.syncToSlides();
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      },
    },
  })),
);
