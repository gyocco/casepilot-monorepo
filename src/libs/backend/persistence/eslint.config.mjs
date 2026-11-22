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
    files: ['src/typeorm/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [{
      regex: '^(?![.]{1,2}/|@casepilot/abstractions$|typeorm$)|apps/|nestjs|@nestjs/',
      message: 'BCK-015/CPA-005: The TypeORM persistence adapter depends only on TypeORM, @casepilot/abstractions and local modules.',
    }] }] },
  },
  {
    files: ['src/typeorm/*repository.ts'],
    rules: { 'no-restricted-syntax': ['error', {
      selector: 'CallExpression > MemberExpression.callee > :matches(Identifier.property[name=/^(transaction|startTransaction|commitTransaction|rollbackTransaction|findAndCount|findAndCountBy)$/], Literal.property[value=/^(transaction|startTransaction|commitTransaction|rollbackTransaction|findAndCount|findAndCountBy)$/])',
      message: 'BCK-009/BCK-010: Shared SQL repositories perform individual operations without composed reads or transactions.',
    }] },
  },
);
