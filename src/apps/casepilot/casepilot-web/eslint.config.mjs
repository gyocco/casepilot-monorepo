import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import { frontendPlugin } from '@casepilot/frontend-architecture/eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'build/**', '.angular/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  { files: ['**/*.mjs'], extends: [eslint.configs.recommended], languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly' } } },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: { frontend: frontendPlugin },
    rules: {
      'frontend/boundaries': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'cp', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'cp', style: 'camelCase' }],
    },
  },
  { files: ['**/*.html'], extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility] },
);
