// Stessi mock degli altri test del service: authService carica Firebase, il
// modulo nativo Google e AsyncStorage all'import.
jest.mock('firebase/auth', () => ({
  signInWithCredential: jest.fn(),
  OAuthProvider: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn() },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock('../../../config/firebase', () => ({ auth: {} }));

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
    sendPasswordReset: jest.fn(),
  },
}));

import { sendPasswordResetEmail } from 'firebase/auth';
import { authService } from '../authService';
import { usersApi } from '../../api/users';

const sendReset = usersApi.sendPasswordReset as jest.Mock;

describe('resetPassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passa dal nostro endpoint, non dal template Firebase', async () => {
    // Il link viene generato lato server con l'Admin SDK e spedito con la
    // nostra email brandizzata: se qualcuno tornasse a Firebase, l'utente
    // riceverebbe una mail diversa da quella prevista.
    sendReset.mockResolvedValue(undefined);

    await authService.resetPassword('tifoso@example.com');

    expect(sendReset).toHaveBeenCalledWith('tifoso@example.com');
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('propaga il fallimento invece di fingere che sia partita', async () => {
    // Chi chiama mostra un errore all'utente: ingoiare qui l'eccezione gli
    // farebbe credere di aver ricevuto una mail che non arrivera' mai.
    sendReset.mockRejectedValue(new Error('SMTP non raggiungibile'));

    await expect(
      authService.resetPassword('tifoso@example.com'),
    ).rejects.toThrow('SMTP non raggiungibile');
  });
});
