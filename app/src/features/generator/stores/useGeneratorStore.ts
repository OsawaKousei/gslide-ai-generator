import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type PresentationManifest, type SlideNode } from '../types';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { copyPresentation } from '../utils/drive-api';
import {
  batchUpdatePresentation,
  type SlideApiRequest,
} from '../utils/slide-api';

type GeneratorState = {
  readonly manifest: PresentationManifest;
  readonly isSyncing: boolean;
  readonly templateId: string | null;
  readonly error: Error | null;
};

type GeneratorActions = {
  readonly setManifest: (manifest: PresentationManifest) => void;
  readonly setTemplateId: (id: string) => void;
  readonly syncToSlides: () => Promise<void>;
};

type Store = GeneratorState & {
  readonly actions: GeneratorActions;
};

const initialState: GeneratorState = {
  manifest: {
    presentationId: null,
    title: 'Untitled Presentation',
    slides: [],
  },
  isSyncing: false,
  templateId: null, // Default or selected
  error: null,
};

// Placeholder: 実際にはスライドの内容に基づいてリクエストを生成する複雑なロジックが必要
const generateRequests = (_slides: readonly SlideNode[]): SlideApiRequest[] => {
  // TODO: Implement actual request builder
  // ここではダミーのリクエストリストを返す
  return [];
};

export const useGeneratorStore = create<Store>()(
  devtools((set, get) => ({
    ...initialState,
    actions: {
      setManifest: (manifest) => set({ manifest }),
      setTemplateId: (templateId) => set({ templateId }),
      syncToSlides: async () => {
        const { manifest, templateId, isSyncing } = get();
        const { accessToken } = useAuthStore.getState();

        if (isSyncing || !accessToken) return;

        set({ isSyncing: true, error: null });

        try {
          // 1. Create Presentation if not exists
          let currentPresentationId = manifest.presentationId;

          if (!currentPresentationId) {
            // eslint-disable-next-line max-depth
            if (!templateId) {
              throw new Error(
                'Template ID is required to create a presentation',
              );
            }

            const copyResult = await copyPresentation({
              templateId,
              title: manifest.title,
              accessToken,
            });

            // eslint-disable-next-line max-depth
            if (copyResult.isErr()) {
              throw copyResult.error;
            }

            currentPresentationId = copyResult.value.id;

            // Generate new manifest with presentationId
            const newManifest: PresentationManifest = {
              ...manifest,
              presentationId: currentPresentationId,
            };
            set({ manifest: newManifest });
          }

          // 2. Generate Batch Update Requests for dirty slides
          // (Simplified: Update all for now or filter dirty)
          const dirtySlides = manifest.slides.filter(
            (s) => s.status === 'dirty' || s.status === 'pending',
          );
          const requests = generateRequests(dirtySlides);

          if (requests.length > 0) {
            const updateResult = await batchUpdatePresentation({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              presentationId: currentPresentationId!,
              requests,
              accessToken,
            });

            // eslint-disable-next-line max-depth
            if (updateResult.isErr()) {
              throw updateResult.error;
            }
          }

          // 3. Update Sync Status
          // Mark all processed slides as synced
          const syncedSlides = manifest.slides.map((s) =>
            s.status === 'dirty' || s.status === 'pending'
              ? ({ ...s, status: 'synced' } as const)
              : s,
          );

          set({
            manifest: {
              ...manifest,
              presentationId: currentPresentationId,
              slides: syncedSlides,
            },
            isSyncing: false,
          });
        } catch (error) {
          set({
            isSyncing: false,
            error:
              error instanceof Error ? error : new Error('Unknown Sync Error'),
          });
        }
      },
    },
  })),
);
