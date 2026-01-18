// src/features/generator/utils/picker-api.ts
import { ResultAsync, okAsync } from 'neverthrow';

// Type definitions for Google Picker
// Note: Normally we would install @types/google.picker, but defining minimally here to avoid dependency

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const PICKER_API_URL = 'https://apis.google.com/js/api.js';

let pickerLoaded = false;

// Load the Google API script and Picker API
export const loadPickerApi = (): ResultAsync<void, Error> => {
  if (pickerLoaded) return okAsync(undefined);

  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PICKER_API_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!window.gapi) {
          reject(new Error('Failed to load gapi'));
          return;
        }
        window.gapi.load('picker', {
          callback: () => {
            pickerLoaded = true;
            resolve();
          },
          onerror: () => reject(new Error('Failed to load Picker API')),
        });
      };
      script.onerror = () => reject(new Error('Failed to load API script'));
      document.body.appendChild(script);
    }),
    (e) => (e instanceof Error ? e : new Error('Unknown Picker Load Error')),
  );
};

export type PickerResult = {
  id: string;
  name: string;
  url: string;
};

// Open the Google Picker
export const openDrivePicker = ({
  accessToken,
  apiKey,
}: {
  accessToken: string;
  apiKey: string;
}): ResultAsync<PickerResult | null, Error> => {
  return loadPickerApi().andThen(() => {
    return ResultAsync.fromPromise(
      new Promise<PickerResult | null>((resolve, reject) => {
        try {
          if (!window.google || !window.google.picker) {
            reject(new Error('Google Picker API not loaded'));
            return;
          }

          const ViewId = window.google.picker.ViewId;
          const Action = window.google.picker.Action;

          // Show specific view for Presentations
          // We can also allow Folders if needed, but for now specific file.
          const view = new window.google.picker.View(ViewId.PRESENTATIONS);

          const picker = new window.google.picker.PickerBuilder()
            .addView(view)
            .setOAuthToken(accessToken)
            .setDeveloperKey(apiKey)
            .setCallback((data: any) => {
              if (data.action === Action.PICKED) {
                const doc = data.docs[0];
                resolve({
                  id: doc.id,
                  name: doc.name,
                  url: doc.url,
                });
              } else if (data.action === Action.CANCEL) {
                resolve(null);
              }
            })
            .build();

          picker.setVisible(true);
        } catch (e) {
          reject(e);
        }
      }),
      (e) => (e instanceof Error ? e : new Error('Picker Error')),
    );
  });
};
