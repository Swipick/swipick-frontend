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

  it('POSTs to /users/sync-apple with the firebase token', async () => {
    const mockResponse = { id: 'user-123', needsProfileCompletion: true };
    mockApiClient.post.mockResolvedValue(mockResponse);

    const result = await usersApi.syncAppleUser('firebase-id-token');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/users/sync-apple',
      { firebaseIdToken: 'firebase-id-token' },
    );
    expect(result).toEqual(mockResponse);
  });

  it('returns needsProfileCompletion false for returning users', async () => {
    const mockResponse = { id: 'user-123', needsProfileCompletion: false };
    mockApiClient.post.mockResolvedValue(mockResponse);

    const result = await usersApi.syncAppleUser('firebase-id-token');

    expect(result.needsProfileCompletion).toBe(false);
  });

  it('throws a user-friendly error when the API call fails', async () => {
    mockApiClient.post.mockRejectedValue({ response: { data: { message: 'Server error' } } });

    await expect(usersApi.syncAppleUser('bad-token')).rejects.toThrow('Server error');
  });
});
