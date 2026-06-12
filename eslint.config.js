// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'web-build/*'],
  },
  {
    // Workaround: la detection automatica della versione React crasha
    // (eslint-plugin-react/resolveBasedir) — versione dichiarata esplicitamente.
    settings: {
      react: { version: '19.1.0' },
    },
    rules: {
      // Il codice esistente ha molti console.log: in produzione vengono
      // rimossi da babel (vedi babel.config.js); qui li segnaliamo come
      // warning per scoraggiarne di nuovi senza bloccare la CI.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Testi italiani: gli apostrofi in JSX sono legittimi.
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    // File di test e mock: ambiente jest
    files: ['**/__tests__/**', '**/__mocks__/**', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]);
