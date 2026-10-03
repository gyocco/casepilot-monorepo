import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Project, ts } from 'ts-morph';
import { validateUseCases, type ArchitectureFinding } from '../../tools/architecture/use-case-rules.js';
import { validateSourceLayout } from '../../tools/architecture/source-layout-rules.js';

const apiDirectory = resolve('build/structure-fixture');
const application = 'src/application/cases/';

function fixture(method: string, models = 'export class ReadCaseRequest { id = "case"; }\nexport class ReadCaseResponse { found = true; }'): Project {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler },
  });
  project.createSourceFile(resolve(apiDirectory, application, 'models.ts'), models);
  project.createSourceFile(resolve(apiDirectory, application, 'read-case.query.ts'), `
    import { ReadCaseRequest, ReadCaseResponse } from './models.js';
    export class ReadCaseQuery { ${method} }
  `);
  return project;
}

// Isolate the reusable BCK contract, which permits synchronous responses.
function check(project: Project): ArchitectureFinding[] {
  return validateUseCases(project, apiDirectory).filter(finding => finding.rule !== 'CPA-002');
}

function cqrsFixture(): Project {
  const project = fixture('execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { return Promise.resolve(new ReadCaseResponse()); }');
  const cqrsDirectory = resolve(apiDirectory, '../../../libs/backend/cqrs/src');
  const actualApiDirectory = fileURLToPath(new URL('../../', import.meta.url));
  for (const file of ['index.ts', 'handler.ts', 'request.ts', 'response.ts', 'page-metadata.response.ts']) {
    project.createSourceFile(resolve(cqrsDirectory, file), readFileSync(resolve(actualApiDirectory, '../../../libs/backend/cqrs/src', file), 'utf8'));
  }
  project.compilerOptions.set({ baseUrl: apiDirectory, paths: { '@casepilot/cqrs': [resolve(cqrsDirectory, 'index.ts')] } });
  project.getSourceFileOrThrow('models.ts').replaceWithText(`
    import { Request, Response } from '@casepilot/cqrs';
    export class ReadCaseRequest extends Request { id = "case"; }
    export class ReadCaseResponse extends Response { found = true; }
  `);
  const handler = project.getSourceFileOrThrow('read-case.query.ts');
  handler.insertStatements(0, "import type { Handler } from '@casepilot/cqrs';");
  handler.getClassOrThrow('ReadCaseQuery').addImplements('Handler<ReadCaseRequest, ReadCaseResponse>');
  handler.getClassOrThrow('ReadCaseQuery').rename('ReadCaseHandler');
  handler.move(resolve(apiDirectory, application, 'read-case.handler.ts'));
  project.resolveSourceFileDependencies();
  return project;
}

function checkContracts(project: Project): ArchitectureFinding[] {
  return validateUseCases(project, apiDirectory).filter(finding => finding.rule === 'CPA-002');
}

void test('accepts synchronous/asynchronous handlers, aliases and returns inside mapping callbacks', () => {
  for (const method of [
    'execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }',
    'async execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { [1].map(value => { return value * 2; }); return new ReadCaseResponse(); }',
    'execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { return Promise.resolve(new ReadCaseResponse()); }',
    'async execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { throw new Error("failure"); }',
  ]) assert.deepEqual(check(fixture(method)), [], method);

  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  project.getSourceFileOrThrow('read-case.query.ts').replaceWithText(`
    import { ReadCaseRequest as Input, ReadCaseResponse as Output } from './models.js';
    export class ReadCaseQuery { execute(request: Input): Output { return new Output(); } }
  `);
  project.createSourceFile(resolve(apiDirectory, 'src/consumer.ts'), `
    import { ReadCaseQuery } from './application/cases/read-case.query.js';
    import { ReadCaseRequest } from './application/cases/models.js';
    new ReadCaseQuery().execute(new ReadCaseRequest());
  `);
  assert.deepEqual(check(project), []);
});

for (const [scenario, method] of [
  ['zero parameters', 'execute(): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['extra parameters', 'execute(request: ReadCaseRequest, tenant: string): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['primitive request', 'execute(request: string): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['optional request', 'execute(request?: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['default request', 'execute(request: ReadCaseRequest = new ReadCaseRequest()): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['rest parameter', 'execute(...request: ReadCaseRequest[]): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['overloads', 'execute(request: ReadCaseRequest): ReadCaseResponse; execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['private entry', 'private execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['missing entry', 'run(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }'],
  ['static entry', 'static execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }'],
] as const) {
  void test(`BCK-004 rejects ${scenario}`, () => {
    assert.ok(check(fixture(method)).some(finding => finding.rule === 'BCK-004'));
  });
}

for (const [scenario, method] of [
  ['inferred return annotation', 'execute(request: ReadCaseRequest) { return new ReadCaseResponse(); }'],
  ['primitive return', 'execute(request: ReadCaseRequest): string { return "ok"; }'],
  ['void return', 'execute(request: ReadCaseRequest): void {}'],
  ['optional return', 'execute(request: ReadCaseRequest): ReadCaseResponse | undefined { return undefined; }'],
  ['nullable return', 'execute(request: ReadCaseRequest): ReadCaseResponse | null { return null; }'],
  ['array return', 'execute(request: ReadCaseRequest): ReadCaseResponse[] { return []; }'],
  ['generic return', 'execute<T>(request: ReadCaseRequest): T { throw new Error(); }'],
  ['structural lookalike', 'execute(request: ReadCaseRequest): ReadCaseResponse { return { found: true }; }'],
  ['empty successful return', 'execute(request: ReadCaseRequest): ReadCaseResponse { return; }'],
] as const) {
  void test(`BCK-005 rejects ${scenario}`, () => {
    const findings = check(fixture(method));
    assert.ok(findings.some(finding => finding.rule === 'BCK-005'));
    assert.ok(findings.every(finding => finding.file.endsWith('read-case.query.ts') && finding.line > 0));
  });
}

void test('requires concrete model classes, rather than interfaces or abstract classes', () => {
  const method = 'execute(request: ReadCaseRequest): ReadCaseResponse { throw new Error(); }';
  for (const models of [
    'export interface ReadCaseRequest {} export interface ReadCaseResponse {}',
    'export abstract class ReadCaseRequest {} export abstract class ReadCaseResponse {}',
  ]) {
    const findings = check(fixture(method, models));
    assert.ok(findings.some(finding => finding.rule === 'BCK-004'));
    assert.ok(findings.some(finding => finding.rule === 'BCK-005'));
  }
});

void test('matches the actual declared response symbol, even when another class has the same name and shape', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new OtherResponse(); }');
  project.createSourceFile(resolve(apiDirectory, application, 'other.ts'), 'export class ReadCaseResponse { found = true; }');
  const handler = project.getSourceFileOrThrow('read-case.query.ts');
  handler.insertStatements(0, "import { ReadCaseResponse as OtherResponse } from './other.js';");
  assert.ok(check(project).some(finding => finding.rule === 'BCK-005'));
});

void test('BCK-004 checks direct call sites, including missing, extra and structural lookalike arguments', () => {
  for (const argumentsText of ['', 'new ReadCaseRequest(), "extra"', '{}']) {
    const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
    project.createSourceFile(resolve(apiDirectory, 'src/consumer.ts'), `
      import { ReadCaseQuery } from './application/cases/read-case.query.js';
      import { ReadCaseRequest } from './application/cases/models.js';
      new ReadCaseQuery().execute(${argumentsText});
    `);
    assert.ok(check(project).some(finding => finding.rule === 'BCK-004' && finding.file === 'src/consumer.ts'), argumentsText);
  }
});

void test('BCK-004 resolves each receiver when different handlers have structurally identical execute signatures', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  project.createSourceFile(resolve(apiDirectory, 'src/application/users/models.ts'), `
    export class ReadUserRequest { id = "user"; }
    export class ReadUserResponse { found = true; }
  `);
  project.createSourceFile(resolve(apiDirectory, 'src/application/users/read-user.query.ts'), `
    import { ReadUserRequest, ReadUserResponse } from './models.js';
    export class ReadUserQuery {
      execute(request: ReadUserRequest): ReadUserResponse { return new ReadUserResponse(); }
    }
  `);
  const consumer = project.createSourceFile(resolve(apiDirectory, 'src/consumer.ts'), `
    import { ReadCaseQuery } from './application/cases/read-case.query.js';
    import { ReadCaseRequest } from './application/cases/models.js';
    import { ReadUserQuery } from './application/users/read-user.query.js';
    import { ReadUserRequest } from './application/users/models.js';
    new ReadCaseQuery().execute(new ReadCaseRequest());
    new ReadUserQuery().execute(new ReadUserRequest());
  `);
  assert.deepEqual(project.getPreEmitDiagnostics(), []);
  assert.deepEqual(check(project), []);
  consumer.replaceWithText(consumer.getFullText().replace('new ReadUserQuery().execute(new ReadUserRequest())', 'new ReadUserQuery().execute(new ReadCaseRequest())'));
  assert.ok(check(project).some(finding => finding.rule === 'BCK-004' && finding.message.includes('ReadUserQuery')));
});

void test('a function-only handler file cannot silently escape class-based checks', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  project.getSourceFileOrThrow('read-case.query.ts').replaceWithText('export function execute(): void {}');
  assert.ok(check(project).some(finding => finding.rule === 'BCK-004'));
});

void test('BCK-004/BCK-005 scan commands, queries and handlers across resources and nested operations', () => {
  for (const [path, suffix] of [
    ['src/application/users/read-case.command.ts', 'Command'],
    ['src/application/orders/read-case.handler.ts', 'Handler'],
    ['src/application/payments/read-case.query.ts', 'Query'],
    ['src/application/orders/read-case/read-case.query.ts', 'Query'],
  ] as const) {
    const project = fixture('execute(): string { return "invalid"; }');
    const handler = project.getSourceFileOrThrow('read-case.query.ts');
    handler.getClassOrThrow('ReadCaseQuery').rename(`ReadCase${suffix}`);
    handler.move(resolve(apiDirectory, path));
    project.getSourceFileOrThrow('models.ts').move(resolve(apiDirectory, 'src/application/shared/read-case.models.ts'));
    assert.deepEqual(project.getPreEmitDiagnostics(), [], path);
    assert.ok(check(project).some(finding => finding.rule === 'BCK-004' && finding.file === path), path);
    assert.ok(check(project).some(finding => finding.rule === 'BCK-005' && finding.file === path), path);
    const execute = handler.getClassOrThrow(`ReadCase${suffix}`).getMethodOrThrow('execute');
    execute.addParameter({ name: 'request', type: 'ReadCaseRequest' });
    execute.setReturnType('ReadCaseResponse');
    execute.setBodyText('return new ReadCaseResponse();');
    assert.deepEqual(check(project), [], path);
    assert.deepEqual(validateSourceLayout(project, apiDirectory), [], path);
  }
});

void test('request and response models outside Application cannot bypass the layer contract', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  project.getSourceFileOrThrow('models.ts').move(resolve(apiDirectory, 'src/domain/models.ts'));
  assert.ok(check(project).some(finding => finding.rule === 'BCK-004'));
  assert.ok(check(project).some(finding => finding.rule === 'BCK-005'));
});

void test('source layout accepts shared layers, technical database/config and bootstrap', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  for (const path of [
    'src/application/users/models.ts', 'src/application/orders/create-order/models.ts',
    'src/application/payments/models.ts', 'src/application/ports/clock.ts', 'src/application/shared/policy.ts',
    'src/domain/entities/customer.ts', 'src/domain/entities/order.ts',
    'src/infrastructure/database/migrations/create-order.ts', 'src/infrastructure/config/options.ts',
    'src/infrastructure/persistence/schemas/order.ts', 'src/presentation/orders/orders.module.ts',
    'src/presentation/orders/order.ts', 'src/app.module.ts',
    'test/integration/fixture.ts',
  ]) project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
  assert.deepEqual(validateSourceLayout(project, apiDirectory), []);
});

void test('CPA-001 rejects technical grouping and ungrouped Application files, even without imports', () => {
  for (const path of [
    'src/application/commands/operation.ts', 'src/application/queries/operation.ts',
    'src/application/commands/orders/operation.ts', 'src/application/queries/users/operation.ts',
    'src/application/orders/commands/operation.ts', 'src/application/users/queries/operation.ts',
    'src/application/payments/refund/commands/operation.ts', 'src/application/orders/Queries/operation.ts',
    'src/application/operation.ts',
  ]) {
    const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
    assert.deepEqual(project.getPreEmitDiagnostics(), [], path);
    const findings = validateSourceLayout(project, apiDirectory);
    assert.equal(findings.length, 1, path);
    assert.equal(findings[0]?.rule, 'CPA-001', path);
    assert.equal(findings[0]?.file, path);
    assert.match(findings[0]?.message ?? '', /src\/application\/<resource>\/.*without commands\/queries/);
  }
});

void test('CPA-001 is scoped to Application sources of this API', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  for (const path of [
    'src/domain/queries/model.ts', 'src/infrastructure/commands/adapter.ts',
    'src/presentation/health/health.module.ts', 'src/presentation/health/transport.ts', 'test/application/queries/fixture.ts',
    '../another-api/src/application/queries/operation.ts',
  ]) project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
  assert.deepEqual(validateSourceLayout(project, apiDirectory), []);
});

void test('CPA-004 accepts resource composition, controllers, transport models and technical modules', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  for (const path of [
    'src/app.module.ts', 'src/api.module.ts', 'src/infrastructure/database/database.module.ts',
    'src/presentation/health/health.module.ts', 'src/presentation/health/health.controller.ts',
    'src/presentation/health/health-http.response.ts', 'src/presentation/health/read/http.response.ts',
    'src/presentation/cases/cases.module.ts', 'src/presentation/cases/cases.controller.ts',
    'test/presentation/fixture.ts', '../another-api/src/health.module.ts',
  ]) project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
  assert.deepEqual(project.getPreEmitDiagnostics(), []);
  assert.deepEqual(validateSourceLayout(project, apiDirectory), []);
});

void test('CPA-004 rejects displaced modules and Presentation files without their resource owner', () => {
  for (const path of [
    'src/health.module.ts', 'src/health.controller.ts', 'src/presentation/health.module.ts',
    'src/presentation/health.controller.ts', 'src/presentation/health-http.response.ts',
    'src/presentation/http/health.controller.ts', 'src/presentation/health/health.controller.ts',
    'src/presentation/health/other.module.ts', 'src/presentation/health/nested/health.module.ts',
    'src/application/health/health.module.ts',
  ]) {
    const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
    assert.deepEqual(project.getPreEmitDiagnostics(), [], path);
    assert.ok(validateSourceLayout(project, apiDirectory).some(finding => finding.rule === 'CPA-004' && finding.file === path), path);
  }
});

void test('CPA-004 keeps requiring the resource module name and direct placement even when an owner exists', () => {
  for (const path of ['src/presentation/health/other.module.ts', 'src/presentation/health/nested/health.module.ts']) {
    const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
    project.createSourceFile(resolve(apiDirectory, 'src/presentation/health/health.module.ts'), 'export const value = 1;');
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
    const findings = validateSourceLayout(project, apiDirectory);
    assert.equal(findings.length, 1, path);
    assert.equal(findings[0]?.rule, 'CPA-004');
    assert.equal(findings[0]?.file, path);
  }
});

void test('CPA-004 selects the real Health presentation files and rejects their previous placement', () => {
  const directory = fileURLToPath(new URL('../../', import.meta.url));
  const project = new Project({ tsConfigFilePath: resolve(directory, 'tsconfig.json') });
  for (const name of ['health.module.ts', 'health.controller.ts', 'health-http.response.ts']) {
    project.getSourceFileOrThrow(resolve(directory, 'src/presentation/health', name));
  }
  assert.deepEqual(validateSourceLayout(project, directory), []);
  project.getSourceFileOrThrow(resolve(directory, 'src/presentation/health/health.module.ts')).move(resolve(directory, 'src/health.module.ts'));
  const findings = validateSourceLayout(project, directory).filter(finding => finding.rule === 'CPA-004');
  for (const path of ['src/health.module.ts', 'src/presentation/health/health.controller.ts', 'src/presentation/health/health-http.response.ts']) {
    assert.ok(findings.some(finding => finding.file === path), path);
  }
});

void test('source layout rejects contexts, feature layers and misplaced database without requiring imports', () => {
  for (const [path, rule] of [
    ['src/contexts/health/domain/model.ts', 'BCK-014'],
    ['src/features/orders/domain/model.ts', 'BCK-014'],
    ['src/domain/orders/domain/model.ts', 'BCK-014'],
    ['src/domain/contexts/orders/model.ts', 'BCK-014'],
    ['src/config/options.ts', 'BCK-014'],
    ['src/database/data-source.ts', 'BCK-017'],
    ['src/infrastructure/persistence/database/data-source.ts', 'BCK-017'],
  ] as const) {
    const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
    project.createSourceFile(resolve(apiDirectory, path), 'export const value = 1;');
    assert.ok(validateSourceLayout(project, apiDirectory).some(finding => finding.file === path && finding.rule === rule), path);
  }
});

void test('the real API sources include the relocated Health handler and its architecture checks', () => {
  const directory = fileURLToPath(new URL('../../', import.meta.url));
  const project = new Project({ tsConfigFilePath: resolve(directory, 'tsconfig.json') });
  const handler = project.getSourceFileOrThrow(resolve(directory, 'src/application/health/get-health-check-objects.handler.ts'));
  assert.deepEqual(validateSourceLayout(project, directory), []);
  assert.deepEqual(validateUseCases(project, directory), []);
  const health = handler.getClassOrThrow('GetHealthCheckObjectsHandler');
  health.removeImplements(0);
  assert.ok(validateUseCases(project, directory).some(finding => finding.rule === 'CPA-002'));
  health.addImplements('Handler<GetHealthCheckObjectsRequest, GetHealthCheckObjectsResponse>');
  handler.getClassOrThrow('GetHealthCheckObjectsHandler').getMethodOrThrow('execute').getParameters()[0]?.remove();
  assert.ok(validateUseCases(project, directory).some(finding => finding.rule === 'BCK-004' && finding.file.endsWith('get-health-check-objects.handler.ts')));
  handler.move(resolve(directory, 'src/application/queries/get-health-check-objects.handler.ts'));
  assert.ok(validateSourceLayout(project, directory).some(finding => finding.rule === 'CPA-001'
    && finding.file === 'src/application/queries/get-health-check-objects.handler.ts'));
});

void test('CPA-002 accepts shared Handler, import aliases, namespace types and reexports', () => {
  for (const [importText, clause] of [
    ["import type { Handler } from '@casepilot/cqrs';", 'Handler'],
    ["import type { Handler as UseCase } from '@casepilot/cqrs';", 'UseCase'],
    ["import type * as Cqrs from '@casepilot/cqrs';", 'Cqrs.Handler'],
    ["import type { UseCase } from './bridge.js';", 'UseCase'],
  ]) {
    const project = cqrsFixture();
    project.createSourceFile(resolve(apiDirectory, application, 'bridge.ts'), "export type { Handler as UseCase } from '@casepilot/cqrs';");
    const file = project.getSourceFileOrThrow('read-case.handler.ts');
    file.getImportDeclarations().find(declaration => declaration.getModuleSpecifierValue() === '@casepilot/cqrs')?.replaceWithText(importText);
    file.getClassOrThrow('ReadCaseHandler').getImplements()[0]?.replaceWithText(`${clause}<ReadCaseRequest, ReadCaseResponse>`);
    assert.deepEqual(project.getPreEmitDiagnostics(), []);
    assert.deepEqual(validateUseCases(project, apiDirectory), []);
  }
});

void test('CPA-002 accepts one Handler contract across resources and nested operations', () => {
  for (const path of ['src/application/orders/read-case.handler.ts', 'src/application/users/read-case/read-case.handler.ts']) {
    const project = cqrsFixture();
    project.getSourceFileOrThrow('read-case.handler.ts').move(resolve(apiDirectory, path));
    assert.deepEqual(project.getPreEmitDiagnostics(), []);
    assert.deepEqual(validateUseCases(project, apiDirectory), []);
  }
});

void test('CPA-002 rejects absent, counterfeit, inherited and locally aliased Handler declarations', () => {
  for (const scenario of ['missing', 'counterfeit', 'inherited', 'local-alias']) {
    const project = cqrsFixture();
    const file = project.getSourceFileOrThrow('read-case.handler.ts');
    const handler = file.getClassOrThrow('ReadCaseHandler');
    handler.removeImplements(0);
    if (scenario === 'counterfeit') {
      file.getImportDeclarations().find(declaration => declaration.getModuleSpecifierValue() === '@casepilot/cqrs')?.remove();
      file.insertStatements(0, 'interface Handler<TRequest, TResponse> { execute(request: TRequest): Promise<TResponse> }');
      handler.addImplements('Handler<ReadCaseRequest, ReadCaseResponse>');
    }
    if (scenario === 'inherited') {
      file.insertStatements(2, 'class Base implements Handler<ReadCaseRequest, ReadCaseResponse> { execute(request: ReadCaseRequest): Promise<ReadCaseResponse> { return Promise.resolve(new ReadCaseResponse()); } }');
      handler.setExtends('Base');
    }
    if (scenario === 'local-alias') {
      file.insertStatements(2, 'type Local = Handler<ReadCaseRequest, ReadCaseResponse>;');
      handler.addImplements('Local');
    }
    assert.deepEqual(project.getPreEmitDiagnostics(), [], scenario);
    assert.ok(checkContracts(project).some(finding => finding.file.endsWith('read-case.handler.ts')), scenario);
  }
});

void test('CPA-002 compares concrete Handler models by symbol, even with identical shapes', () => {
  for (const argumentsText of ['OtherRequest, ReadCaseResponse', 'ReadCaseRequest, OtherResponse', 'any, ReadCaseResponse']) {
    const project = cqrsFixture();
    const file = project.getSourceFileOrThrow('read-case.handler.ts');
    file.insertStatements(2, 'class OtherRequest extends ReadCaseRequest {} class OtherResponse extends ReadCaseResponse {}');
    file.getClassOrThrow('ReadCaseHandler').getImplements()[0]?.replaceWithText(`Handler<${argumentsText}>`);
    assert.deepEqual(project.getPreEmitDiagnostics(), []);
    assert.ok(checkContracts(project).some(finding => finding.file.endsWith('read-case.handler.ts')), argumentsText);
  }
});

void test('CPA-002 accepts indirect inheritance and rejects models lacking the shared Request/Response bases', () => {
  const inherited = cqrsFixture();
  inherited.getSourceFileOrThrow('models.ts').replaceWithText(`
    import { Request as Input, Response as Output } from '@casepilot/cqrs';
    abstract class CommonRequest extends Input {}
    abstract class CommonResponse extends Output {}
    export class ReadCaseRequest extends CommonRequest { id = "case"; }
    export class ReadCaseResponse extends CommonResponse { found = true; }
  `);
  assert.deepEqual(inherited.getPreEmitDiagnostics(), []);
  assert.deepEqual(validateUseCases(inherited, apiDirectory), []);
  for (const kind of ['Request', 'Response']) {
    const project = cqrsFixture();
    project.getSourceFileOrThrow('models.ts').addClass({ name: 'Detached' + kind, isExported: true });
    assert.deepEqual(project.getPreEmitDiagnostics(), []);
    assert.ok(checkContracts(project).some(finding => finding.file.endsWith('models.ts') && finding.message.includes(kind)), kind);
  }
  const counterfeit = cqrsFixture();
  counterfeit.getSourceFileOrThrow('models.ts').replaceWithText(`
    class Request {} class Response {}
    export class ReadCaseRequest extends Request { id = "case"; }
    export class ReadCaseResponse extends Response { found = true; }
  `);
  assert.equal(checkContracts(counterfeit).filter(finding => finding.file.endsWith('models.ts')).length, 4);
});

void test('CPA-002 requires OperationHandler names and .handler.ts files without compiler failures', () => {
  const oldName = cqrsFixture();
  oldName.getSourceFileOrThrow('read-case.handler.ts').getClassOrThrow('ReadCaseHandler').rename('ReadCaseQuery');
  assert.deepEqual(oldName.getPreEmitDiagnostics(), []);
  assert.ok(checkContracts(oldName).length > 0);
  const oldFile = cqrsFixture();
  oldFile.getSourceFileOrThrow('read-case.handler.ts').move(resolve(apiDirectory, application, 'read-case.query.ts'));
  assert.deepEqual(oldFile.getPreEmitDiagnostics(), []);
  assert.ok(checkContracts(oldFile).length > 0);
  const mismatchedFile = cqrsFixture();
  mismatchedFile.getSourceFileOrThrow('read-case.handler.ts').move(resolve(apiDirectory, application, 'another-name.handler.ts'));
  assert.deepEqual(mismatchedFile.getPreEmitDiagnostics(), []);
  assert.ok(checkContracts(mismatchedFile).length > 0);
});

void test('CPA-002 rejects synchronous execution and stays scoped to this API Application', () => {
  const synchronous = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  assert.deepEqual(synchronous.getPreEmitDiagnostics(), []);
  assert.ok(checkContracts(synchronous).length > 0);
  const project = cqrsFixture();
  for (const path of ['src/infrastructure/read.handler.ts', 'test/read.handler.ts', '../other-api/src/application/users/read.handler.ts']) {
    project.createSourceFile(resolve(apiDirectory, path), 'export class ReadHandler { execute(): void {} }');
  }
  assert.deepEqual(checkContracts(project), []);
});
