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
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        // Use the same source project as the editor. Tests/tools retain tsconfig.test.json.
        project: false,
        projectService: true,
      },
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
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: ":matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration)[source.value=/^(?:@casepilot\\/abstractions\\/(?!typeorm$)|.*libs\\/backend\\/abstractions\\/)/]",
        message: 'CPA-003: Use the public @casepilot/abstractions entry or its Infrastructure-only /typeorm adapter.',
      }],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@nestjs/*', '@casepilot/exception-handler/nestjs', 'typeorm', 'typeorm/*', '@casepilot/abstractions/typeorm', 'pg', 'pg/*', 'node:*', '**/infrastructure/**', '**/presentation/**', '**/database/**', '**/config/**'],
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
    files: ['src/application/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: ":matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration)[source.value=/^(?:@casepilot\\/abstractions\\/(?!typeorm$)|.*libs\\/backend\\/abstractions\\/)/]",
          message: 'CPA-003: Use the public abstractions entry point.',
        },
        {
          selector: "ImportDeclaration[source.value='@casepilot/cqrs'][importKind!='type'] > ImportSpecifier[importKind!='type']:matches([imported.name='Handler'], [imported.value='Handler'])",
          message: 'CPA-002: Import Handler as a type; Request and Response are runtime bases.',
        },
        {
          selector: "ExportNamedDeclaration[source.value='@casepilot/cqrs'][exportKind!='type'] > ExportSpecifier[exportKind!='type'][local.name='Handler']",
          message: 'CPA-002: Reexport Handler as a type.',
        },
        {
          selector: ":matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration)[source.value=/^(?:@casepilot\\/cqrs\\/|.*libs\\/backend\\/cqrs\\/)/]",
          message: 'CPA-002: Consume CQRS contracts through the public @casepilot/cqrs entry point.',
        },
      ],
    },
  },
  {
    files: ['src/presentation/**/*.ts'],
    ignores: ['src/presentation/*/*.module.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['typeorm', 'typeorm/*', 'pg', 'pg/*', '**/domain/**', '**/infrastructure/**', '**/database/**', '**/*.module', '**/*.module.js', '**/*.module.ts'],
          message: 'BCK-003/BCK-008/CPA-004: Transport delegates to Application and cannot import persistence, Domain or composition modules.',
        }],
      }],
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@nestjs/*', '@casepilot/exception-handler/nestjs', 'typeorm', 'typeorm/*', '@casepilot/abstractions/typeorm', 'pg', 'pg/*', 'node:*', '**/application/**', '**/infrastructure/**', '**/presentation/**', '**/database/**', '**/config/**'],
          message: 'BCK-002/BCK-008: Domain contains data/contracts and cannot depend on other layers.',
        }],
      }],
    },
  },
  {
    files: ['src/infrastructure/**/repositories/**/*.ts', 'src/infrastructure/**/*.repository.ts'],
    rules: {
      'no-restricted-syntax': ['error',
        {
          selector: ":matches(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration)[source.value=/^(?:@casepilot\\/abstractions\\/(?!typeorm$)|.*libs\\/backend\\/abstractions\\/)/]",
          message: 'CPA-003: Use the public abstractions entry point.',
        },
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
        {
          selector: "CallExpression > MemberExpression.callee > Literal.property[value=/^findAndCount(By)?$/]",
          message: 'BCK-009: Application coordinates item and count reads, including computed members.',
        },
      ],
    },
  },
  {
    files: ['src/infrastructure/persistence/schemas/**/*.ts', 'src/infrastructure/persistence/entities/**/*.ts', 'src/infrastructure/persistence/models/**/*.ts'],
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
    files: ['src/infrastructure/database/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "Property:matches([key.name='synchronize'], [key.value='synchronize'])[value.value=true]",
        message: 'BCK-017: The schema evolves through versioned migrations, with synchronize: false.',
      }],
    },
  },
);
