import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'node:url';

export default tseslint.config(
  { ignores: ['dist/**', 'build/**', 'node_modules/**'] },
  { linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' } },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.test.json'],
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-extraneous-class': ['error', { allowEmpty: true, allowWithDecorator: true }],
    },
  },
  {
    files: ['test/integration/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/infra/**', '**/load-backend-config*'],
          message: 'Endpoint fixtures use only their owned Testcontainers database, never development credentials.',
        }],
      }],
    },
  },
  {
    files: ['src/contexts/**/domain/**/*.ts', 'src/contexts/**/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@nestjs/*', 'typeorm', 'typeorm/*', 'pg', 'pg/*', 'node:*', '**/infrastructure/**', '**/presentation/**', '**/database/**', '**/config/**'],
          message: 'BCK-008: Domain/Application depend on internal models and ports, not runtime adapters.',
        }],
      }],
      'no-restricted-globals': ['error',
        { name: 'process', message: 'BCK-008: Process configuration belongs to adapters/composition.' },
        { name: 'fetch', message: 'BCK-008: External I/O belongs behind an internal port.' },
      ],
    },
  },
  {
    files: ['src/contexts/**/presentation/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['typeorm', 'typeorm/*', 'pg', '**/domain/**', '**/infrastructure/**', '**/database/**'],
          message: 'BCK-003/BCK-008: HTTP delegates to Application and cannot access persistence or Domain directly.',
        }],
      }],
    },
  },
  {
    files: ['src/contexts/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@nestjs/*', 'typeorm', 'typeorm/*', 'pg', 'pg/*', 'node:*', '**/application/**', '**/infrastructure/**', '**/presentation/**', '**/database/**', '**/config/**'],
          message: 'BCK-002/BCK-008: Domain contains data/contracts and cannot depend on other layers.',
        }],
      }],
    },
  },
  {
    files: ['src/contexts/**/infrastructure/**/repositories/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: "CallExpression > MemberExpression.callee > Identifier.property[name=/^(transaction|startTransaction|commitTransaction|rollbackTransaction)$/]",
          message: 'BCK-010: Repositories participate in a received scope; they cannot manage transactions.',
        },
        {
          selector: "CallExpression > MemberExpression.callee > Literal.property[value=/^(transaction|startTransaction|commitTransaction|rollbackTransaction)$/]",
          message: 'BCK-010: Repositories cannot manage transactions through computed literal members.',
        },
        {
          selector: "CallExpression > MemberExpression.callee > Identifier.property[name=/^findAndCount(By)?$/]",
          message: 'BCK-009: Application coordinates the item and count reads explicitly.',
        },
      ],
    },
  },
  {
    files: ['src/contexts/**/infrastructure/persistence/schemas/**/*.ts', 'src/contexts/**/infrastructure/persistence/entities/**/*.ts', 'src/contexts/**/infrastructure/persistence/models/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: "Property:matches([key.name='cascade'], [key.value='cascade']):matches([value.value=true], [value.type='ArrayExpression'][value.elements.length>0])",
          message: 'BCK-012: ORM write cascades hide additional persistence operations.',
        },
        {
          selector: "Property:matches([key.name='lazy'], [key.value='lazy'])[value.value=true]",
          message: 'BCK-012: Materialize relations explicitly; lazy relations hide deferred I/O.',
        },
        {
          selector: "Property:matches([key.name='onDelete'], [key.value='onDelete'])[value.value=/^CASCADE$/i]",
          message: 'BCK-012: Database delete cascades hide additional persistence operations.',
        },
        {
          selector: "Property:matches([key.name='orphanedRowAction'], [key.value='orphanedRowAction'])[value.value=/^(delete|soft-delete)$/]",
          message: 'BCK-012: Orphan removal must be an explicit Application operation.',
        },
      ],
    },
  },
  {
    files: ['src/database/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "Property:matches([key.name='synchronize'], [key.value='synchronize'])[value.value=true]",
        message: 'BCK-017: The schema evolves through versioned migrations, with synchronize: false.',
      }],
    },
  },
);
