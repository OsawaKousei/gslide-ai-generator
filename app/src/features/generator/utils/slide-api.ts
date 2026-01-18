import { ResultAsync, ok, err } from 'neverthrow';

export type SlideApiRequest = Record<string, unknown>;

// 新規プレゼンテーション作成
export const createPresentation = (
  title: string,
  accessToken: string,
): ResultAsync<{ presentationId: string; name: string }, Error> => {
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
  ).map((json: any) => ({
    presentationId: json.presentationId,
    name: json.title,
  }));
};

export const batchUpdatePresentation = (
  presentationId: string,
  requests: readonly SlideApiRequest[],
  accessToken: string,
): ResultAsync<unknown, Error> => {
  if (requests.length === 0) {
    return ok(undefined);
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
