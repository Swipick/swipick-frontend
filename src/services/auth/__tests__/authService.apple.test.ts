// Mock Firebase auth before importing authService
jest.mock('firebase/auth', () => ({
  signInWithCredential: jest.fn(),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    credential: jest.fn().mockReturnValue({ providerId: 'apple.com' }),
  })),
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../../../config/firebase', () => ({
  auth: {},
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../api/users', () => ({
  usersApi: {
    syncAppleUser: jest.fn(),
    syncGoogleUser: jest.fn(),
  },
}));

import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithCredential, OAuthProvider } from 'firebase/auth';
import { authService } from '../authService';
import { usersApi } from '../../api/users';

const mockSignInWithCredential = signInWithCredential as jest.Mock;
const mockSyncAppleUser = usersApi.syncAppleUser as jest.Mock;
const mockIsAvailable = AppleAuthentication.isAvailableAsync as jest.Mock;
const mockSignInAsync = AppleAuthentication.signInAsync as jest.Mock;

const mockFirebaseUser = {
  uid: 'firebase-uid-apple',
  email: 'user@privaterelay.appleid.com',
  getIdToken: jest.fn().mockResolvedValue('firebase-id-token'),
};

describe('authService.signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailable.mockResolvedValue(true);
    mockSignInAsync.mockResolvedValue({
      identityToken: 'apple-identity-token',
      user: 'apple-sub',
    });
    mockSignInWithCredential.mockResolvedValue({ user: mockFirebaseUser });
    mockSyncAppleUser.mockResolvedValue({ id: 'db-user-id', needsProfileCompletion: false });
  });

  it('calls AppleAuthentication.signInAsync with FULL_NAME and EMAIL scopes', async () => {
    await authService.signInWithApple();

    expect(mockSignInAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      }),
    );
  });

  it('creates a Firebase OAuthProvider credential and signs in', async () => {
    await authService.signInWithApple();

    expect(mockSignInWithCredential).toHaveBeenCalled();
  });

  it('calls syncAppleUser with the Firebase ID token', async () => {
    await authService.signInWithApple();

    expect(mockSyncAppleUser).toHaveBeenCalledWith('firebase-id-token');
  });

  it('returns the Firebase user on success', async () => {
    const user = await authService.signInWithApple();

    expect(user.uid).toBe('firebase-uid-apple');
  });

  it('throws when Apple Sign-In is unavailable (non-iOS)', async () => {
    mockIsAvailable.mockResolvedValue(false);

    await expect(authService.signInWithApple()).rejects.toThrow(
      'apple-sign-in-unavailable',
    );
  });

  it('propagates cancellation error from Apple', async () => {
    const cancelError = { code: 'ERR_REQUEST_CANCELED' };
    mockSignInAsync.mockRejectedValue(cancelError);

    await expect(authService.signInWithApple()).rejects.toMatchObject({
      code: 'ERR_REQUEST_CANCELED',
    });
  });
});
