// src/features/auth/utils/gis-sdk.ts
import { ok, err, type Result, ResultAsync } from 'neverthrow';
import { env } from '../../../env';

// Google Identity Services (GIS) types
// 本来は @types/google.accounts を入れるべきだが、ここでは最小限の定義で済ませる
type TokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
};

type GoogleGlobal = {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }) => TokenClient;
    };
  };
};

type CustomWindow = Window & {
  google?: GoogleGlobal;
};

const getCustomWindow = (): CustomWindow => window as unknown as CustomWindow;

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/presentations',
  'email',
  'profile',
].join(' ');

let tokenClient: TokenClient | null = null;

// Script Loading
const loadGisScript = (): ResultAsync<void, Error> => {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`)) {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Google Identity Services script'));
      document.body.appendChild(script);
    }),
    (e) => (e instanceof Error ? e : new Error('Unknown script load error')),
  );
};

// Initialize Token Client
const initClient = (
  onSuccess: (token: string) => void,
  onError: (error: Error) => void,
): Result<void, Error> => {
  if (!env.VITE_GOOGLE_CLIENT_ID) {
    return err(new Error('Missing VITE_GOOGLE_CLIENT_ID in env'));
  }

  const win = getCustomWindow();
  if (!win.google) {
    return err(new Error('Google object not found. Script not loaded?'));
  }

  try {
    tokenClient = win.google.accounts.oauth2.initTokenClient({
      client_id: env.VITE_GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (resp: TokenResponse) => {
        if (resp.error) {
          onError(new Error(`Google Auth Error: ${resp.error}`));
          return;
        }
        if (resp.access_token) {
          onSuccess(resp.access_token);
        }
      },
    });
    return ok(undefined);
  } catch (e) {
    return err(
      e instanceof Error ? e : new Error('Failed to initialize token client'),
    );
  }
};

// Public Action
export const requestGoogleToken = (
  onSuccess: (token: string) => void,
  onError: (error: Error) => void,
): ResultAsync<void, Error> => {
  // If client exists, just request
  if (tokenClient) {
    tokenClient.requestAccessToken();
    return ResultAsync.fromSafePromise(Promise.resolve());
  }

  // Otherwise load script -> init -> request
  return loadGisScript()
    .andThen(() => initClient(onSuccess, onError))
    .map(() => {
      // initClient ensures tokenClient is set if Ok
      tokenClient?.requestAccessToken();
    });
};

// User Info Fetching (using the token)
export const fetchUserInfo = (
  token: string,
): ResultAsync<{ name: string; email: string; picture: string }, Error> => {
  return ResultAsync.fromPromise(
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (res) => {
      if (!res.ok) throw new Error('Failed to fetch user info');
      return res.json() as Promise<{
        name: string;
        email: string;
        picture: string;
      }>; // sub, etc.
    }),
    (e) => (e instanceof Error ? e : new Error('UserInfo fetch failed')),
  );
};
