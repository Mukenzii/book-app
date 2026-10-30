// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'design-context/*', '.expo/*'],
  },
  {
    rules: {
      // Falsy `&&` values render as bare text and crash React Native.
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary', 'coerce'] }],
    },
  },
  {
    files: ['**/__tests__/**', 'jest.setup.js'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', test: 'readonly' },
    },
  },
]);
