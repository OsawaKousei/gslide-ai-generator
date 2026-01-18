import { ResultAsync, ok, err } from 'neverthrow';
import { z } from 'zod';

const DriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type DriveFile = z.infer<typeof DriveFileSchema>;

type CopyPresentationParams = {
  templateId: string;
  title: string;
  accessToken: string;
};

export const copyPresentation = ({
  templateId,
  title,
  accessToken,
}: CopyPresentationParams): ResultAsync<DriveFile, Error> => {
  return ResultAsync.fromPromise(
    fetch(
      `https://www.googleapis.com/drive/v3/files/${templateId}/copy?fields=id,name`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: title }),
      },
    ).then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Drive API Error: ${res.status} ${res.statusText} - ${errorText}`,
        );
      }
      return res.json();
    }),
    (e) => (e instanceof Error ? e : new Error('Unknown Drive API Error')),
  ).andThen((json) => {
    const result = DriveFileSchema.safeParse(json);
    if (!result.success) {
      return err(new Error(`Invalid API Response: ${result.error.message}`));
    }
    return ok(result.data);
  });
};
