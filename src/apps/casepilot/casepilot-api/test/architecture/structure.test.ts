import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { Project, ts } from 'ts-morph';
import { validateUseCases, type ArchitectureFinding } from '../../tools/architecture/use-case-rules.js';

const apiDirectory = resolve('build/structure-fixture');
const application = 'src/contexts/cases/application/queries/';

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

function check(project: Project): ArchitectureFinding[] { return validateUseCases(project, apiDirectory); }

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
    import { ReadCaseQuery } from './contexts/cases/application/queries/read-case.query.js';
    import { ReadCaseRequest } from './contexts/cases/application/queries/models.js';
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
      import { ReadCaseQuery } from './contexts/cases/application/queries/read-case.query.js';
      import { ReadCaseRequest } from './contexts/cases/application/queries/models.js';
      new ReadCaseQuery().execute(${argumentsText});
    `);
    assert.ok(check(project).some(finding => finding.rule === 'BCK-004' && finding.file === 'src/consumer.ts'), argumentsText);
  }
});

void test('a function-only handler file cannot silently escape class-based checks', () => {
  const project = fixture('execute(request: ReadCaseRequest): ReadCaseResponse { return new ReadCaseResponse(); }');
  project.getSourceFileOrThrow('read-case.query.ts').replaceWithText('export function execute(): void {}');
  assert.ok(check(project).some(finding => finding.rule === 'BCK-004'));
});
