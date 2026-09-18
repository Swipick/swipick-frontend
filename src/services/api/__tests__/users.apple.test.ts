jest.mock('../client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { usersApi } from '../users';
import { apiClient } from '../client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('usersApi.syncAppleUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Il BFF incarta il DTO in { success, data, message } e dentro mette
  // profileCompleted: i mock qui sotto copiano quella forma, non una comoda.
  const envelope = (data: Record<string, unknown>) => ({
    success: true,
    data,
    message: 'Utente sincronizzato con successo',
  });

  it('POSTs to /users/sync-apple with the firebase token', async () => {
    mockApiClient.post.mockResolvedValue(
      envelope({ id: 'user-123', profileCompleted: false })
    );

    const result = await usersApi.syncAppleUser('firebase-id-token');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/users/sync-apple',
      { firebaseIdToken: 'firebase-id-token' },
    );
    expect(result).toEqual({ id: 'user-123', needsProfileCompletion: true });
  });

  it('returns needsProfileCompletion false for returning users', async () => {
    mockApiClient.post.mockResolvedValue(
      envelope({ id: 'user-123', profileCompleted: true })
    );

    const result = await usersApi.syncAppleUser('firebase-id-token');

    expect(result.needsProfileCompletion).toBe(false);
  });

  // Il getter needsProfileCompletion non sopravvive a JSON.stringify: se un
  // giorno tornasse sul filo non deve comunque contare piu' di profileCompleted.
  it('ignores a needsProfileCompletion that is not on the wire', async () => {
    mockApiClient.post.mockResolvedValue(envelope({ id: 'user-123' }));

    const result = await usersApi.syncAppleUser('firebase-id-token');

    expect(result).toEqual({ id: 'user-123', needsProfileCompletion: false });
  });

  it('throws a user-friendly error when the API call fails', async () => {
    mockApiClient.post.mockRejectedValue({ response: { data: { message: 'Server error' } } });

    await expect(usersApi.syncAppleUser('bad-token')).rejects.toThrow('Server error');
  });
});
