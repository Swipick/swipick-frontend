jest.mock('../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { usersApi } from '../users';
import { apiClient } from '../client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('usersApi.registerUser — passo 1 senza nickname', () => {
  beforeEach(() => jest.clearAllMocks());

  it('manda solo email e password: il nickname arriva al passo 2', async () => {
    mockApiClient.post.mockResolvedValue({ id: 'u-1', profileCompleted: false });

    await usersApi.registerUser({ email: 'mario@example.com', password: 'lunghissima' });

    expect(mockApiClient.post).toHaveBeenCalledWith('/users/register', {
      email: 'mario@example.com',
      password: 'lunghissima',
    });
  });
});

describe('usersApi.isNicknameAvailable', () => {
  beforeEach(() => jest.clearAllMocks());

  it('interroga il backend con il nickname nell-indirizzo', async () => {
    mockApiClient.get.mockResolvedValue({ available: true });

    const result = await usersApi.isNicknameAvailable('mario_rossi');

    expect(mockApiClient.get).toHaveBeenCalledWith(
      '/users/nickname-available/mario_rossi'
    );
    expect(result).toBe(true);
  });

  it('riporta il nickname occupato', async () => {
    mockApiClient.get.mockResolvedValue({ available: false });

    await expect(usersApi.isNicknameAvailable('mario_rossi')).resolves.toBe(false);
  });

  it('in caso di errore di rete non blocca: risponde libero', async () => {
    mockApiClient.get.mockRejectedValue(new Error('network down'));

    await expect(usersApi.isNicknameAvailable('mario_rossi')).resolves.toBe(true);
  });
});

describe('usersApi.completeProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POSTa il nickname sull-id utente del backend', async () => {
    mockApiClient.post.mockResolvedValue({ success: true });

    await usersApi.completeProfile('u-1', 'mario_rossi');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/users/complete-profile/u-1',
      { nickname: 'mario_rossi' }
    );
  });

  it('rilancia il messaggio del backend quando il nickname è occupato', async () => {
    mockApiClient.post.mockRejectedValue({
      response: { data: { message: 'Questo nickname è già in uso' } },
    });

    await expect(usersApi.completeProfile('u-1', 'mario_rossi')).rejects.toThrow(
      'Questo nickname è già in uso'
    );
  });
});
