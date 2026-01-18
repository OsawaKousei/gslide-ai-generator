// src/features/auth/stores/useAuthStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type AuthState } from '../types';
import { requestGoogleToken, fetchUserInfo } from '../utils/gis-sdk';

type AuthActions = {
  readonly login: () => Promise<void>;
  readonly logout: () => void;
};

type Store = AuthState & {
  readonly actions: AuthActions;
};

const initialState: AuthState = {
  status: 'idle',
  user: null,
  accessToken: null,
  error: null,
};

export const useAuthStore = create<Store>()(
  devtools((set) => ({
    ...initialState,
    actions: {
      login: async () => {
        set({ status: 'idle', error: null }); // Reset error

        await requestGoogleToken(
          (token) => {
            // Token success
            set({ accessToken: token }); // Temporary state

            // Fetch User Info immediately
            fetchUserInfo(token).match(
              (user) => {
                set({
                  status: 'authenticated',
                  user: {
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                  },
                  accessToken: token,
                });
              },
              (error) => {
                set({ status: 'unauthenticated', error });
              },
            );
          },
          (error) => {
            // Token error
            set({ status: 'unauthenticated', error });
          },
        );
      },
      logout: () => {
        // Token revocation could be added here if strict security is needed
        set({ ...initialState, status: 'unauthenticated' });
      },
    },
  })),
);
