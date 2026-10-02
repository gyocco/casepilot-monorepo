import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';

export default tseslint.config(
  { ignores: ['dist/**', 'build/**', 'node_modules/**'] },
  { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: { parserOptions: {
      project: ['./tsconfig.json', './tsconfig.test.json'],
      tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
    } },
    rules: { 'no-undef': 'off', '@typescript-eslint/consistent-type-imports': 'error' },
  },
  {
    files: ['src/**/*.ts'], ignores: ['src/dataaccess/typeorm/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/)|typeorm',
      message: 'BCK-008/BCK-015/CPA-003: The main abstractions entry depends only on pure local contracts/models.',
    }] }] },
  },
  {
    files: ['src/dataaccess/typeorm/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|typeorm$)',
      message: 'BCK-015: The transaction adapter depends only on TypeORM and local abstractions.',
    }] }] },
  },
);
