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

type UploadPresentationParams = {
  file: File;
  accessToken: string;
};

export const uploadPresentation = ({
  file,
  accessToken,
}: UploadPresentationParams): ResultAsync<DriveFile, Error> => {
  return ResultAsync.fromPromise(
    (async () => {
      const metadata = {
        name: file.name,
        mimeType: 'application/vnd.google-apps.presentation',
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      );
      form.append('file', file);

      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Drive Upload Error: ${res.status} ${res.statusText} - ${errorText}`,
        );
      }

      return res.json();
    })(),
    (e) => (e instanceof Error ? e : new Error('Unknown Drive Upload Error')),
  ).andThen((json) => {
    const result = DriveFileSchema.safeParse(json);
    if (!result.success) {
      return err(new Error(`Invalid Upload Response: ${result.error.message}`));
    }
    return ok(result.data);
  });
};
