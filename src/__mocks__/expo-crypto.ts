export const CryptoDigestAlgorithm = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
  MD2: 'MD2',
  MD4: 'MD4',
  MD5: 'MD5',
};

export const randomUUID = jest.fn(() => 'mock-raw-nonce-uuid');

export const digestStringAsync = jest.fn(async (_algorithm: string, _data: string) => {
  return 'mock-hashed-nonce';
});
