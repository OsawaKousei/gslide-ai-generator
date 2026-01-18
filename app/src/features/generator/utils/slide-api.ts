import { ResultAsync, ok, okAsync, err } from 'neverthrow';
import { z } from 'zod';

export type SlideApiRequest = Record<string, unknown>;

const CreatePresentationSchema = z.object({
  presentationId: z.string(),
  title: z.string(),
});

type CreatePresentationParams = {
  title: string;
  accessToken: string;
};

// 新規プレゼンテーション作成
export const createPresentation = ({
  title,
  accessToken,
}: CreatePresentationParams): ResultAsync<
  { presentationId: string; name: string },
  Error
> => {
  return ResultAsync.fromPromise(
    fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Slides API Error (Create): ${res.status} ${res.statusText} - ${errorText}`,
        );
      }
      return res.json();
    }),
    (e) => (e instanceof Error ? e : new Error('Unknown Slides API Error')),
  ).andThen((json) => {
    const result = CreatePresentationSchema.safeParse(json);
    if (!result.success) {
      return err(new Error(`Invalid API Response: ${result.error.message}`));
    }
    return ok({
      presentationId: result.data.presentationId,
      name: result.data.title,
    });
  });
};

type BatchUpdateParams = {
  presentationId: string;
  requests: readonly SlideApiRequest[];
  accessToken: string;
};

export const batchUpdatePresentation = ({
  presentationId,
  requests,
  accessToken,
}: BatchUpdateParams): ResultAsync<unknown, Error> => {
  if (requests.length === 0) {
    return okAsync(undefined);
  }

  return ResultAsync.fromPromise(
    fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      },
    ).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Slides API Error: ${res.status} ${res.statusText} - ${errorText}`,
        );
      }
      return res.json();
    }),
    (e) => (e instanceof Error ? e : new Error('Unknown Slides API Error')),
  );
};
