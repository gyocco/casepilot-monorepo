// Composition is restricted further by the CPA-004 source-layout gate.
const resourceModule = '^src/presentation/([^/]+)/\\1\\.module\\.ts$';

/** @type {import('dependency-cruiser').IConfiguration} */
const configuration = {
  forbidden: [
    {
      name: 'BCK-023-shared-no-operations', severity: 'error',
      comment: 'Shared data, rules and ports cannot depend on operations, including through type imports or reexports.',
      from: { path: '^src/application/(?:shared/|ports/|[^/]+/shared/)' },
      to: { path: '^src/application/(?!shared/|ports/)[^/]+/(?!shared/)[^/]+/', reachable: true },
    },
    {
      name: 'BCK-008-errors-core-no-nestjs', severity: 'error',
      comment: 'Core layers use pure errors and cannot reach the NestJS transport adapter through barrels.',
      from: { path: '^src/(domain|application)/' },
      to: { path: '(^|/)libs/backend/exception-handler/(src|dist)/nestjs/', reachable: true },
    },
    {
      name: 'CPA-005-auth-public-entry', severity: 'error',
      from: { path: '^src/' },
      to: { path: '(^|/)libs/backend/auth/(src|dist)/', pathNot: ['/(?:src|dist)/index\\.(?:ts|js|d\\.ts)$', '/firebase/index\\.(?:ts|js|d\\.ts)$', '/nestjs/index\\.(?:ts|js|d\\.ts)$'] },
    },
    {
      name: 'BCK-008-auth-core-no-adapters', severity: 'error',
      comment: 'Core layers consume only pure VerifiedIdentity/TokenVerifier contracts, never Firebase or NestJS auth adapters.',
      from: { path: '^src/(domain|application)/' },
      to: { path: '(^|/)libs/backend/auth/(src|dist)/(firebase|nestjs)/', reachable: true },
    },
    {
      name: 'BCK-003-presentation-no-auth-provider', severity: 'error',
      comment: 'Presentation transport cannot reach Firebase Admin or auth provider adapters directly.',
      from: { path: '^src/presentation/', pathNot: resourceModule },
      to: { path: '(^|/)libs/backend/auth/(src|dist)/firebase/|(^|/)node_modules/firebase-admin/', reachable: true },
    },
    {
      name: 'CPA-005-validation-public-entry', severity: 'error',
      from: { path: '^src/' },
      to: { path: '(^|/)libs/backend/validation/(src|dist)/', pathNot: ['/(?:src|dist)/index\\.(?:ts|js|d\\.ts)$', '/nestjs/index\\.(?:ts|js|d\\.ts)$'] },
    },
    {
      name: 'BCK-008-validation-core-no-nestjs', severity: 'error',
      from: { path: '^src/(domain|application)/' },
      to: { path: '(^|/)libs/backend/validation/(src|dist)/nestjs/', reachable: true },
    },
    {
      name: 'BCK-008-abstractions-core-no-node', severity: 'error',
      from: { path: '^src/(domain|application)/' },
      to: { path: '(^|/)libs/backend/abstractions/(src|dist)/node/', reachable: true },
    },
    {
      name: 'BCK-003-presentation-no-shared-runtime-adapters', severity: 'error',
      from: { path: '^src/presentation/', pathNot: resourceModule },
      to: { path: '(^|/)libs/backend/abstractions/(src|dist)/(node|dataaccess/typeorm)/', reachable: true },
    },
    {
      name: 'CPA-003-abstractions-public-entry', severity: 'error',
      comment: 'Consume only the main public index or the Infrastructure-only TypeORM index.',
      from: { path: '^src/' },
      to: { path: '(^|/)libs/backend/abstractions/(src|dist)/', pathNot: ['/(?:src|dist)/index\\.(?:ts|js|d\\.ts)$', '/dataaccess/typeorm/index\\.(?:ts|js|d\\.ts)$', '/node/index\\.(?:ts|js|d\\.ts)$'] },
    },
    {
      name: 'BCK-008-abstractions-core-no-typeorm', severity: 'error',
      comment: 'Core layers cannot reach the TypeORM adapter, including via barrels.',
      from: { path: '^src/(domain|application)/' },
      to: { path: '(^|/)libs/backend/abstractions/(src|dist)/dataaccess/typeorm/', reachable: true },
    },
    {
      name: 'CPA-002-cqrs-public-entry', severity: 'error',
      comment: 'Application imports the CQRS public index, never private package modules.',
      from: { path: '^src/application/' },
      to: { path: '(^|/)libs/backend/cqrs/(src|dist)/', pathNot: '/index\\.(?:ts|js|d\\.ts)$' },
    },
    { name: 'BCK-008-no-cycles', comment: 'Keep the dependency graph acyclic, including type-only dependencies.', severity: 'error', from: {}, to: { circular: true } },
    { name: 'BCK-019-resolvable-imports', comment: 'Every analyzed dependency must resolve; an unresolved import cannot be architecture-checked.', severity: 'error', from: {}, to: { couldNotResolve: true } },
    {
      name: 'BCK-019-no-dev-dependencies-in-runtime', severity: 'error',
      comment: 'Production sources cannot consume development-only tools or test dependencies.',
      from: { path: '^src/' }, to: { dependencyTypes: ['npm-dev'] },
    },
    {
      name: 'BCK-008-domain-layers', severity: 'error',
      comment: 'Domain cannot reach other layers, runtime configuration or composition, including through reexports.',
      from: { path: '^src/domain/' },
      to: {
        path: '^src/(application/|infrastructure/|presentation/|(?:main|create-app|[^/]+\\.module)\\.ts$)',
        reachable: true,
      },
    },
    {
      name: 'BCK-008-application-layers', severity: 'error',
      comment: 'Application depends on models and ports; adapters and composition cannot be imported through barrels.',
      from: { path: '^src/application/' },
      to: {
        path: '^src/(infrastructure/|presentation/|(?:main|create-app|[^/]+\\.module)\\.ts$)',
        reachable: true,
      },
    },
    {
      name: 'BCK-008-core-node-apis', severity: 'error',
      comment: 'Node runtime capabilities belong in adapters behind internal ports.',
      from: { path: '^src/(domain|application)/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'BCK-008-core-frameworks-and-providers', severity: 'error',
      comment: 'Keep framework, ORM and recognized provider SDK types/implementations outside Domain and Application.',
      from: { path: '^src/(domain|application)/' },
      to: {
        path: '(^|/)node_modules/(@nestjs/|typeorm/|pg/|firebase-admin/|firebase/|@google-cloud/|@neondatabase/|@angular/|react/|react-dom/|@ionic/|@capacitor/|@aws-sdk/|@azure/)',
        reachable: true,
      },
    },
    {
      name: 'BCK-003-presentation-delegates-to-application', severity: 'error',
      comment: 'Presentation invokes Application; it cannot directly consume Domain, persistence or Infrastructure.',
      from: { path: '^src/presentation/', pathNot: resourceModule },
      to: { path: '^src/(domain/|infrastructure/)' },
    },
    {
      name: 'CPA-004-transport-no-composition', severity: 'error',
      comment: 'Transport cannot reach composition modules, including through Presentation barrels.',
      from: { path: '^src/presentation/', pathNot: resourceModule },
      to: { path: '^src/.*\\.module\\.ts$', reachable: true },
    },
    {
      name: 'BCK-003-presentation-no-drivers', severity: 'error',
      comment: 'HTTP and other input adapters cannot directly import database drivers or ORM.',
      from: { path: '^src/presentation/', pathNot: resourceModule },
      to: { path: '(^|/)node_modules/(typeorm|pg)/' },
    },
    {
      name: 'BCK-008-infrastructure-no-presentation', severity: 'error',
      comment: 'Infrastructure implements internal contracts independently of input adapters.',
      from: { path: '^src/infrastructure/' },
      to: { path: '^src/presentation/' },
    },
    {
      name: 'BCK-015-no-other-apps', severity: 'error',
      comment: 'An app cannot consume another app to share product logic; backend libraries and contracts are permitted.',
      from: { path: '^src/' },
      to: { path: '^\\.\\./|(^|/)src/apps/', pathNot: ['^(?:\\.\\./)+(?:libs/backend/|contracts/)', '(^|/)node_modules/'] },
    },
    {
      name: 'BCK-015-backend-no-client-libs', severity: 'error',
      comment: 'Backend processes cannot depend on frontend or mobile runtime libraries.',
      from: { path: '^src/' }, to: { path: '(^|/)libs/(frontend|mobile)/' },
    },
    {
      name: 'BCK-019-no-tests-or-tools-in-runtime', severity: 'error',
      comment: 'Tests and validators belong to development and cannot be runtime dependencies.',
      from: { path: '^src/' }, to: { path: '(^|/)(test|tests|tools)/' },
    },
  ],
  options: {
    // Keep external dependencies visible to rules, but do not traverse their internals.
    doNotFollow: { path: '(^|/)node_modules/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      mainFields: ['types', 'typings', 'module', 'main'],
      extensions: ['.ts', '.tsx', '.d.ts', '.js', '.mjs', '.json'],
      conditionNames: ['import', 'types', 'node', 'default'],
    },
  },
};

export default configuration;
