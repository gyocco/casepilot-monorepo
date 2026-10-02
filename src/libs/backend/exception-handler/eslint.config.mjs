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
    files: ['src/**/*.ts'], ignores: ['src/nestjs/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|@casepilot/abstractions$)|/nestjs/',
      message: 'BCK-008/BCK-015: The main error entry depends only on pure local contracts and public abstractions.',
    }] }] },
  },
  {
    files: ['src/**/*.ts'],
    rules: { 'no-restricted-syntax': ['error', {
      selector: ":matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration)[source.value=/apps\\//]",
      message: 'BCK-015: A general purpose library cannot depend on apps.',
    }] },
  },
);
