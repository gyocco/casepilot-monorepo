import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import { frontendPlugin } from '@casepilot/frontend-architecture/eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'build/**', 'node_modules/**'] },
  { files: ['**/*.mjs'], extends: [eslint.configs.recommended] },
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: { frontend: frontendPlugin },
    rules: {
      'frontend/boundaries': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'pilot', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'pilot', style: 'camelCase' }],
    },
  },
  { files: ['**/*.html'], extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility] },
);
