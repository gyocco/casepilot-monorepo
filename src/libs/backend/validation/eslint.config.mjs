import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';

export default tseslint.config(
  { ignores: ['dist/**', 'build/**', 'node_modules/**'] },
  { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: { parserOptions: { project: ['./tsconfig.json', './tsconfig.test.json'], tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)) } },
    rules: { 'no-undef': 'off', '@typescript-eslint/consistent-type-imports': 'error' },
  },
  {
    files: ['src/**/*.ts'], ignores: ['src/nestjs/**/*.ts'],
    languageOptions: { parserOptions: { project: false, projectService: true } },
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|@casepilot/abstractions$)|(?:apps/|dataaccess/typeorm/|/node/|nestjs/)',
      message: 'BCK-008/BCK-015/CPA-005: Structural validation uses pure public contracts, never apps or runtime adapters.',
    }] }] },
  },
  {
    files: ['src/nestjs/**/*.ts'],
    languageOptions: { parserOptions: { project: false, projectService: true } },
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|@casepilot/abstractions$|@casepilot/cqrs$|@nestjs/common$)|apps/|typeorm|/node/',
      message: 'BCK-008/BCK-015/CPA-005: HTTP validation depends on pure contracts and NestJS, never product apps.',
    }] }] },
  },
);
