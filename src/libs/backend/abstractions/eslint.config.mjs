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
    files: ['src/**/*.ts'],
    languageOptions: { parserOptions: { project: false, projectService: true } },
  },
  {
    files: ['src/**/*.ts'], ignores: ['src/node/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/)|typeorm|@casepilot/persistence|(?:^|/)persistence(?:/|$)|(?:^|/)node(?:/|$)|apps/',
      message: 'BCK-008/BCK-015/CPA-003: The main abstractions entry depends only on pure local contracts/models, never concrete persistence/ORM/runtime adapters.',
    }] }] },
  },
  {
    files: ['src/node/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|node:crypto$)|apps/|typeorm|@casepilot/persistence|(?:^|/)persistence(?:/|$)|presentation/|application/',
      message: 'BCK-008/BCK-015/CPA-005: Node adapters use pure local ports and approved Node APIs.',
    }] }] },
  },
);
