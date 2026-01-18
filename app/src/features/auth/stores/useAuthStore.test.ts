// src/features/auth/stores/useAuthStore.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';
import * as gisSdk from '../utils/gis-sdk';
import { ResultAsync } from 'neverthrow';

// Enable mocking
vi.mock('../utils/gis-sdk');

describe('useAuthStore', () => {
  const initialState = useAuthStore.getState();

  beforeEach(() => {
    useAuthStore.setState(initialState);
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.status).toBe('idle');
    expect(state.user).toBeNull();
  });

  it('should handle successful login flow', async () => {
    const mockToken = 'mock-access-token';
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/pic.jpg',
    };

    // Mock implementation for the callback-based requestGoogleToken
    vi.mocked(gisSdk.requestGoogleToken).mockImplementation((onSuccess) => {
      onSuccess(mockToken);
      return ResultAsync.fromSafePromise(Promise.resolve());
    });

    // Mock implementation for fetchUserInfo returning ResultAsync
    vi.mocked(gisSdk.fetchUserInfo).mockReturnValue(
      ResultAsync.fromSafePromise(Promise.resolve(mockUser)),
    );

    // Trigger Login
    await useAuthStore.getState().actions.login();

    // Verification
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(mockUser);
    expect(state.error).toBeNull();
  });

  it('should handle login error', async () => {
    const mockError = new Error('Popup closed');

    // Mock error in token request
    vi.mocked(gisSdk.requestGoogleToken).mockImplementation((_, onError) => {
      onError(mockError);
      return ResultAsync.fromSafePromise(Promise.resolve());
    });

    await useAuthStore.getState().actions.login();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.error).toBe(mockError);
  });

  it('should logout correctly', () => {
    // Set authenticated state manually
    useAuthStore.setState({
      status: 'authenticated',
      user: { name: 'Me', email: 'me@me.com', picture: '' },
      accessToken: 'token',
    });

    useAuthStore.getState().actions.logout();

    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });
});
