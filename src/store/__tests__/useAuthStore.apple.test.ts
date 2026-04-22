jest.mock('../../services/auth/authService', () => ({
  authService: {
    signInWithApple: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

jest.mock('firebase/auth', () => ({}));

import { act } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { authService } from '../../services/auth/authService';

const mockSignInWithApple = authService.signInWithApple as jest.Mock;

describe('useAuthStore - signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, firebaseUser: null, loading: false, error: null });
  });

  it('sets loading true while signing in and false on success', async () => {
    const mockUser = {
      uid: 'apple-uid',
      email: 'user@apple.com',
      displayName: 'Apple User',
      emailVerified: true,
    };
    mockSignInWithApple.mockResolvedValue(mockUser);

    await act(async () => {
      await useAuthStore.getState().signInWithApple();
    });

    expect(useAuthStore.getState().loading).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('sets error when sign-in fails', async () => {
    mockSignInWithApple.mockRejectedValue(new Error('apple-sign-in-cancelled'));

    await act(async () => {
      try {
        await useAuthStore.getState().signInWithApple();
      } catch {}
    });

    expect(useAuthStore.getState().error).toBe('apple-sign-in-cancelled');
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
