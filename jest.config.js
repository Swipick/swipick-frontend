'use strict';

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: './babel.config.js',
        caller: { name: 'metro', bundler: 'metro', platform: 'ios' },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'react-native' +
      '|@react-native' +
      '|expo(?!/src/winter)' +
      '|@expo' +
      '|react-navigation' +
      '|@react-navigation' +
      '|zustand' +
      '|firebase' +
      '|axios' +
      ')/)',
  ],
  moduleNameMapper: {
    // Stub expo-apple-authentication with our controlled mock
    '^expo-apple-authentication$':
      '<rootDir>/src/__mocks__/expo-apple-authentication.ts',
    // Prevent expo's winter ESM runtime from loading in jest
    '^expo/src/winter/.*$': '<rootDir>/src/__mocks__/expo-winter-stub.js',
    // Stub the ESM-only @ungap/structured-clone
    '^@ungap/structured-clone$':
      '<rootDir>/src/__mocks__/structured-clone-stub.js',
    // Stub expo-crypto
    '^expo-crypto$': '<rootDir>/src/__mocks__/expo-crypto.ts',
    // Asset mocks
    '\\.(png|jpg|jpeg|gif|svg|webp)$':
      '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/src/__mocks__/jest-setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  passWithNoTests: true,
};
