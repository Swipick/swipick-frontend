// Stessi mock del test Apple: authService importa Firebase, il modulo nativo
// Google e AsyncStorage al caricamento.
jest.mock('firebase/auth', () => ({
  signInWithCredential: jest.fn(),
  OAuthProvider: jest.fn(),
  GoogleAuthProvider: { credential: jest.fn().mockReturnValue({}) },
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
    hasPlayServices: jest.fn().mockResolvedValue(true),
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
  usersApi: { syncAppleUser: jest.fn(), syncGoogleUser: jest.fn() },
}));

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService, describeAuthError } from '../authService';

const signInMock = GoogleSignin.signIn as jest.Mock;

describe('describeAuthError', () => {
  it('preferisce il codice quando c’è, che è la sigla più stabile', () => {
    expect(describeAuthError({ code: 'SIGN_IN_REQUIRED', message: 'x' })).toBe(
      'SIGN_IN_REQUIRED',
    );
  });

  it('accetta anche i codici numerici degli SDK nativi', () => {
    expect(describeAuthError({ code: -2 })).toBe('-2');
  });

  it('ripiega sul messaggio quando il codice manca', () => {
    expect(
      describeAuthError(new Error('A problem reading the keychain.')),
    ).toBe('A problem reading the keychain.');
  });

  it('tronca i messaggi lunghi, che in un alert non entrerebbero', () => {
    const hint = describeAuthError(new Error('x'.repeat(200)));
    expect(hint).toHaveLength(81); // 80 caratteri + ellissi
    expect(hint.endsWith('…')).toBe(true);
  });

  it('non esplode su errori senza forma', () => {
    expect(describeAuthError(null)).toBe('errore sconosciuto');
    expect(describeAuthError(undefined)).toBe('errore sconosciuto');
    expect(describeAuthError({})).toBe('errore sconosciuto');
  });
});

describe('signInWithGoogle: diagnosi degli errori non mappati', () => {
  beforeEach(() => jest.clearAllMocks());

  it('porta la causa nativa nel messaggio invece di ingoiarla', async () => {
    // Il caso reale: l'SDK Google non riesce a scrivere nel portachiavi.
    signInMock.mockRejectedValue(
      new Error(
        'RNGoogleSignIn: A problem reading or writing to the application keychain.',
      ),
    );

    await expect(authService.signInWithGoogle()).rejects.toThrow(
      /portachiavi|keychain/i,
    );
  });

  it('allega l’errore originale come cause, per chi legge i log', async () => {
    const nativeError = new Error('keychain error');
    signInMock.mockRejectedValue(nativeError);

    await expect(authService.signInWithGoogle()).rejects.toMatchObject({
      cause: nativeError,
    });
  });

  it('lascia intatti i messaggi già mappati, senza appiccicare sigle', async () => {
    signInMock.mockRejectedValue({ code: 'auth/invalid-credential' });

    await expect(authService.signInWithGoogle()).rejects.toThrow(
      'Credenziali non valide. Verifica email e password.',
    );
  });

  it('continua a distinguere l’annullamento, che non è un errore', async () => {
    signInMock.mockRejectedValue({ code: 'SIGN_IN_CANCELLED' });

    await expect(authService.signInWithGoogle()).rejects.toThrow(
      'Google sign-in was cancelled',
    );
  });

  it('segnala il token mancante invece di un generico "riprova"', async () => {
    signInMock.mockResolvedValue({ data: {} }); // nessun idToken

    await expect(authService.signInWithGoogle()).rejects.toThrow(
      /No ID token/i,
    );
  });
});
