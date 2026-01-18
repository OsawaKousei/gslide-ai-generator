import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type PresentationManifest, type SlideNode } from '../types';
import { useAuthStore } from '../../auth/stores/useAuthStore';
import { copyPresentation } from '../utils/drive-api';
import {
  batchUpdatePresentation,
  getPresentation,
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

// スライド更新用のリクエストを生成
const generateRequests = (
  manifestSlides: readonly SlideNode[],
  realSlides: ReadonlyArray<{ objectId: string }>,
): SlideApiRequest[] => {
  const requests: SlideApiRequest[] = [];
  const simulatedRealSlides = [...realSlides];
  const templateSourceId = realSlides[0]?.objectId; // Use first slide as template for new ones

  manifestSlides.forEach((slide, index) => {
    let targetObjectId: string;

    // 1. Determine Target ID (Existing or New)
    if (index < simulatedRealSlides.length && simulatedRealSlides[index]) {
      // Existing slide
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetObjectId = simulatedRealSlides[index]!.objectId;
    } else {
      // New slide needed
      if (!templateSourceId) return; // Cannot create without template

      // New ID must be unique and valid. UUID is fine, but lets remove dashes to be safe for Google API IDs if strict
      targetObjectId = `slide_${slide.id.replace(/-/g, '_')}`;

      requests.push({
        duplicateObject: {
          objectId: targetObjectId,
          sourceObjectId: templateSourceId,
        },
      });

      // Move the new slide to the end (optional, duplicateObject places at end by default if insertionIndex not specified)
      // Add to simulated tracking
      simulatedRealSlides.push({ objectId: targetObjectId });
    }

    // 2. Content Updates (Only if dirty or pending (new))
    if (slide.status === 'dirty' || slide.status === 'pending') {
      const { title, body } = slide.content;

      // Update Title
      if (title) {
        requests.push({
          replaceAllText: {
            containsText: { text: '{{title}}', matchCase: true },
            replaceText: title,
            pageObjectIds: [targetObjectId],
          },
        });
      }

      // Update Body (bullets etc)
      if (body && Array.isArray(body)) {
        const bodyText = body.join('\n');
        requests.push({
          replaceAllText: {
            containsText: { text: '{{body}}', matchCase: true },
            replaceText: bodyText,
            pageObjectIds: [targetObjectId],
          },
        });
      }
    }
  });

  // Remove excess slides if manifest has fewer than real
  // (Optional: For now we don't delete to be safe, or we can implement deleteObject)

  return requests;
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
          }

          // 2. Fetch Current Slides Structure (to get objectIds)

          if (!currentPresentationId) {
            throw new Error('Presentation ID is required');
          }

          const getResult = await getPresentation({
            presentationId: currentPresentationId,
            accessToken,
          });

          if (getResult.isErr()) {
            throw getResult.error;
          }

          const currentSlides = getResult.value.slides;

          // 3. Generate Requests
          const requests = generateRequests(manifest.slides, currentSlides);

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

          // 4. Update Sync Status & IDs
          // Hydrate manifest with actual objectIds (rough mapping for now)
          // Note: If we added slides, we used predicted IDs.
          // Correct way is to fetch again, but for now assuming strict order.

          // Re-fetch to be sure about Object IDs if we want perfect sync state?
          // For PoC, simply marking as synced is enough.

          const syncedSlides = manifest.slides.map((s, i) => {
            // If we had an existing slide, use its ID.
            // If we created a new one, we know the ID we generated.
            const existingSlide = currentSlides[i];
            const objectId = existingSlide
              ? existingSlide.objectId
              : `slide_${s.id.replace(/-/g, '_')}`;

            return {
              ...s,
              objectId,
              status: 'synced',
            } as const;
          });

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
