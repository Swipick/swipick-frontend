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
  unlink: jest.fn(),
}));

// L'oggetto nasce dentro la factory: jest issa jest.mock sopra le const del
// modulo, quindi una definita qui fuori arriverebbe ancora non inizializzata.
jest.mock('../../../config/firebase', () => ({ auth: { currentUser: null } }));

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

import { unlink } from 'firebase/auth';
import { authService } from '../authService';
import { auth } from '../../../config/firebase';

const mockUnlink = unlink as jest.Mock;
const mockAuth = auth as unknown as {
  currentUser: { providerData: { providerId: string }[] } | null;
};

/** Firebase tiene i metodi collegati su providerData: e' quella la verita'. */
const conProvider = (...ids: string[]) => {
  mockAuth.currentUser = { providerData: ids.map((providerId) => ({ providerId })) };
};

describe('unlinkProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('stacca il provider quando restano altri modi per entrare', async () => {
    conProvider('google.com', 'password');

    await authService.unlinkProvider('google.com');

    expect(mockUnlink).toHaveBeenCalledWith(mockAuth.currentUser, 'google.com');
  });

  it("rifiuta di staccare l'ultimo metodo rimasto", async () => {
    // Senza questo controllo l'account resterebbe senza nessuno che possa
    // piu' aprirlo, e non e' una cosa da cui si torna indietro da soli.
    conProvider('google.com');

    await expect(authService.unlinkProvider('google.com')).rejects.toThrow(
      /unico metodo di accesso/,
    );
    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('rifiuta un provider che non e’ collegato', async () => {
    conProvider('google.com', 'password');

    await expect(authService.unlinkProvider('apple.com')).rejects.toThrow(
      /non e’ collegato/,
    );
    expect(mockUnlink).not.toHaveBeenCalled();
  });

  it('rifiuta se non c’e’ nessun utente in sessione', async () => {
    await expect(authService.unlinkProvider('google.com')).rejects.toThrow(
      'Nessun utente collegato',
    );
    expect(mockUnlink).not.toHaveBeenCalled();
  });
});
