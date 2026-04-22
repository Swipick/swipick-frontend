export const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
};

export const AppleAuthenticationButtonType = {
  SIGN_IN: 0,
  CONTINUE: 1,
};

export const AppleAuthenticationButtonStyle = {
  WHITE: 0,
  WHITE_OUTLINE: 1,
  BLACK: 2,
};

export const isAvailableAsync = jest.fn().mockResolvedValue(true);

export const signInAsync = jest.fn().mockResolvedValue({
  user: 'mock-apple-user-id',
  email: 'user@privaterelay.appleid.com',
  fullName: { givenName: 'John', familyName: 'Apple' },
  identityToken: 'mock-apple-identity-token',
  authorizationCode: 'mock-authorization-code',
  realUserStatus: 1,
});

export const AppleAuthenticationButton = 'AppleAuthenticationButton';
