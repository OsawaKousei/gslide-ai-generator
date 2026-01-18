import { ResultAsync, ok, err } from 'neverthrow';

export type SlideApiRequest = Record<string, unknown>;

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
