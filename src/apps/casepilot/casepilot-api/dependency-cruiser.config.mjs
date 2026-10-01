/** @type {import('dependency-cruiser').IConfiguration} */
const configuration = {
  forbidden: [
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
      from: { path: '^src/contexts/[^/]+/domain/' },
      to: {
        path: '^src/(contexts/[^/]+/(application/|infrastructure/|presentation/|[^/]+\\.module\\.ts$)|database/|config/|(?:main|create-app|app\\.module)\\.ts$)',
        reachable: true,
      },
    },
    {
      name: 'BCK-008-application-layers', severity: 'error',
      comment: 'Application depends on models and ports; adapters and composition cannot be imported through barrels.',
      from: { path: '^src/contexts/[^/]+/application/' },
      to: {
        path: '^src/(contexts/[^/]+/(infrastructure/|presentation/|[^/]+\\.module\\.ts$)|database/|config/|(?:main|create-app|app\\.module)\\.ts$)',
        reachable: true,
      },
    },
    {
      name: 'BCK-008-core-node-apis', severity: 'error',
      comment: 'Node runtime capabilities belong in adapters behind internal ports.',
      from: { path: '^src/contexts/[^/]+/(domain|application)/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'BCK-008-core-frameworks-and-providers', severity: 'error',
      comment: 'Keep framework, ORM and recognized provider SDK types/implementations outside Domain and Application.',
      from: { path: '^src/contexts/[^/]+/(domain|application)/' },
      to: {
        path: '(^|/)node_modules/(@nestjs/|typeorm/|pg/|react/|react-dom/|@ionic/|@capacitor/|@aws-sdk/|@azure/)',
        reachable: true,
      },
    },
    {
      name: 'BCK-003-presentation-delegates-to-application', severity: 'error',
      comment: 'Presentation invokes Application; it cannot directly consume Domain, persistence or Infrastructure.',
      from: { path: '^src/contexts/[^/]+/presentation/' },
      to: { path: '^src/(contexts/[^/]+/(domain/|infrastructure/)|database/)' },
    },
    {
      name: 'BCK-003-presentation-no-drivers', severity: 'error',
      comment: 'HTTP and other input adapters cannot directly import database drivers or ORM.',
      from: { path: '^src/contexts/[^/]+/presentation/' },
      to: { path: '(^|/)node_modules/(typeorm|pg)/' },
    },
    {
      name: 'BCK-008-infrastructure-no-presentation', severity: 'error',
      comment: 'Infrastructure implements internal contracts independently of input adapters.',
      from: { path: '^src/contexts/[^/]+/infrastructure/' },
      to: { path: '^src/contexts/[^/]+/presentation/' },
    },
    {
      name: 'BCK-014-context-public-api', severity: 'error',
      comment: 'Use the owning context public.ts entry point; private cross-context imports are forbidden.',
      from: { path: '^src/contexts/([^/]+)/' },
      to: { path: '^src/contexts/', pathNot: ['^src/contexts/$1/', '^src/contexts/[^/]+/public\\.ts$'] },
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
      extensions: ['.ts', '.tsx', '.d.ts', '.js', '.mjs', '.json'],
      conditionNames: ['import', 'types', 'node', 'default'],
    },
  },
};

export default configuration;
