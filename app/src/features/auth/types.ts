// src/features/auth/types.ts

export type UserProfile = {
  readonly email: string;
  readonly name: string;
  readonly picture: string;
};

export type AuthStatus = 'idle' | 'unauthenticated' | 'authenticated';

export type AuthState = {
  readonly status: AuthStatus;
  readonly user: UserProfile | null;
  readonly accessToken: string | null;
  readonly error: Error | null;
};
