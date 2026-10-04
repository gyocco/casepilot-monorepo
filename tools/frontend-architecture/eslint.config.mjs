import eslint from '@eslint/js';

export default [
  { ignores: ['node_modules/**', 'build/**'] },
  eslint.configs.recommended,
  { languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly' } } },
];
