import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Project, ts } from 'ts-morph';
import { validateDataAccess } from '../../tools/architecture/data-access-rules.js';

const actualApiDirectory = fileURLToPath(new URL('../../', import.meta.url));
const apiDirectory = resolve('build/data-access-fixture/src/apps/casepilot/casepilot-api');

function fixture(methods = ''): Project {
  const project = new Project({ useInMemoryFileSystem: true, compilerOptions: {
    strict: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  } });
  const library = resolve(apiDirectory, '../../../libs/backend/abstractions/src');
  for (const file of ['index.ts', 'errors.ts', 'json-value.ts', 'crud-runtime.ts', 'dataaccess/models/stored-entity.ts', 'dataaccess/scoped-data-repository.ts', 'dataaccess/persistence-error.ts', 'dataaccess/run-persistence.ts', 'dataaccess/models/entity.ts', 'dataaccess/models/page-request.ts', 'dataaccess/models/page-response.ts', 'dataaccess/repository.ts', 'dataaccess/crud-repository.ts', 'dataaccess/unit-of-work.ts', 'dataaccess/unit-of-work-error.ts']) {
    project.createSourceFile(resolve(library, file), readFileSync(resolve(actualApiDirectory, '../../../libs/backend/abstractions/src', file), 'utf8'));
  }
  project.compilerOptions.set({ baseUrl: apiDirectory, paths: { '@casepilot/abstractions': [resolve(library, 'index.ts')] } });
  project.createSourceFile(resolve(apiDirectory, 'src/domain/entities/row.ts'), `
    import type { Entity } from '@casepilot/abstractions';
    export class Row implements Entity<string> { readonly id = 'row'; readonly value = 'value'; }
    export class Custom { readonly id = 'custom'; }
    export interface Filter { readonly value: string }
  `);
  project.createSourceFile(resolve(apiDirectory, 'src/domain/repositories/row.repository.ts'), `
    import type { CrudRepository, PageRequest, PageResponse, Entity } from '@casepilot/abstractions';
    import type { Row, Custom, Filter } from '../entities/row.js';
    export interface RowRepository extends CrudRepository<Row> { ${methods} }
  `);
  project.resolveSourceFileDependencies();
  return project;
}

function rules(project: Project): string[] { return validateDataAccess(project, apiDirectory).map(finding => finding.rule); }

void test('CPA-005 resolves Entity and inherited repository signatures from the extracted shared contracts', () => {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/domain/entities/shared-row.ts'), `
    import { StoredEntity } from '@casepilot/abstractions';
    export class SharedRow extends StoredEntity { readonly label = 'example'; }
  `);
  project.createSourceFile(resolve(apiDirectory, 'src/domain/repositories/shared-row.repository.ts'), `
    import type { ScopedDataRepository } from '@casepilot/abstractions';
    import type { SharedRow } from '../entities/shared-row.js';
    export interface SharedRowRepository extends ScopedDataRepository<SharedRow> {}
  `);
  project.resolveSourceFileDependencies();
  assert.deepEqual(project.getPreEmitDiagnostics(), []);
  assert.deepEqual(validateDataAccess(project, apiDirectory), []);
});

void test('accepts primitive unions, entities, shared pages, arrays and constrained generics', () => {
  const project = fixture(`
    find(id: string | number | bigint, flags: readonly boolean[]): Promise<readonly Row[]>;
    page(request: PageRequest): Promise<PageResponse<Row>>;
    optional(id?: string): Promise<Row | null>;
    write(entity: Row): void;
    generic<T extends Entity<string>>(entity: T): Promise<T>;
    literal(direction: 'asc' | 'desc'): Promise<number>;
    symbols(id: symbol): Promise<undefined>;
  `);
  assert.deepEqual(validateDataAccess(project, apiDirectory), []);
  assert.deepEqual(project.getPreEmitDiagnostics(), []);
});

for (const type of ['Custom', 'Filter', '{ value: string }', 'Record<string, string>', 'Partial<Row>', 'Pick<Row, "id">', 'object', 'any', 'unknown', 'Date', 'Map<string, Row>', '[Row, number]', 'Row & { extra: string }', '() => Row']) {
  void test(`BCK-021 rejects ${type} in parameters and responses`, () => {
    for (const method of [`find(value: ${type}): Promise<Row[]>;`, `find(): Promise<${type}>;`]) {
      const project = fixture(method);
      assert.deepEqual(project.getPreEmitDiagnostics(), [], 'The fixture is compilable; failure is architectural.');
      assert.ok(rules(project).includes('BCK-021'), method);
    }
  });
}

void test('BCK-021 checks unconstrained generics, overloads and function properties', () => {
  for (const method of [
    'find<T>(value: T): Promise<Row[]>;',
    'find<T extends Custom>(): Promise<T>;',
    'find: (filter: Filter) => Promise<Row[]>;',
    'find(id: string): Promise<Row[]>; find(filter: Filter): Promise<Row[]>;',
    'find(): Promise<readonly Filter[]>;',
  ]) assert.ok(rules(fixture(method)).includes('BCK-021'), method);
});

void test('BCK-021 validates public implementation methods while allowing technical constructors/private helpers', () => {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/infrastructure/persistence/repositories/read.ts'), `
    import type { Repository } from '@casepilot/abstractions';
    import type { Row, Filter } from '../../../domain/entities/row.js';
    export class ReadRepository implements Repository<Row> {
      declare readonly entityType?: Row;
      constructor(private readonly connection: Date) {}
      async getAll(): Promise<readonly Row[]> { return []; }
      private helper(filter: Filter): Filter { return filter; }
    }
  `);
  assert.deepEqual(validateDataAccess(project, apiDirectory), []);
  const implementation = project.getSourceFileOrThrow('read.ts').getClassOrThrow('ReadRepository');
  implementation.addMethod({ name: 'find', parameters: [{ name: 'filter', type: 'Filter' }], returnType: 'Promise<readonly Row[]>', statements: 'return Promise.resolve([]);' });
  assert.ok(rules(project).includes('BCK-021'));
});

void test('BCK-021 rejects invalid PageResponse items and repository-valued operation parameters', () => {
  for (const method of [
    'find(): Promise<PageResponse<Custom>>;',
    'find(): Promise<PageResponse<any>>;',
    'find(other: CrudRepository<Row>): Promise<Row[]>;',
  ]) assert.ok(rules(fixture(method)).includes('BCK-021'), method);
});

void test('BCK-021 rejects same-shape entities, local pages and custom page subclasses', () => {
  const project = fixture('find(entity: Custom): Promise<Row[]>;');
  assert.ok(rules(project).includes('BCK-021'));
  project.getSourceFileOrThrow('row.repository.ts').replaceWithText(`
    import type { CrudRepository } from '@casepilot/abstractions';
    import type { Row } from '../entities/row.js';
    class PageRequest { pageNumber = 1; pageSize = 20; }
    export interface RowRepository extends CrudRepository<Row> { find(page: PageRequest): Promise<Row[]>; }
  `);
  assert.ok(rules(project).includes('BCK-021'));
  project.getSourceFileOrThrow('row.repository.ts').replaceWithText(`
    import { PageRequest, type CrudRepository } from '@casepilot/abstractions';
    import type { Row } from '../entities/row.js';
    class CustomPage extends PageRequest { filter = 'hidden'; }
    export interface RowRepository extends CrudRepository<Row> { find(page: CustomPage): Promise<Row[]>; }
  `);
  assert.ok(rules(project).includes('BCK-021'));
});

void test('BCK-021 resolves inherited operations, aliases, reexports and indirect Entity heritage', () => {
  const project = fixture('find(value: Row): Promise<Row[]>;');
  project.getSourceFileOrThrow('row.ts').replaceWithText(`
    import type { Entity as Base } from '@casepilot/abstractions';
    interface Data extends Base<string> {}
    class Parent implements Data { readonly id = 'row'; }
    export class Row extends Parent { readonly value = 'value'; }
  `);
  project.createSourceFile(resolve(apiDirectory, 'src/domain/entities/shared.ts'), "export type { Row as Item } from './row.js';");
  const contract = project.getSourceFileOrThrow('row.repository.ts');
  contract.replaceWithText(`
    import type { Repository as Base } from '@casepilot/abstractions';
    import type { Item } from '../entities/shared.js';
    interface Parent extends Base<Item> { find(value: string): Promise<Item[]>; }
    export interface RowRepository extends Parent {}
  `);
  assert.deepEqual(validateDataAccess(project, apiDirectory), []);
  contract.replaceWithText(contract.getFullText().replace('value: string', 'value: { id: string }'));
  assert.ok(rules(project).includes('BCK-021'));
});

void test('CPA-003 detects renamed contracts in repository folders and structural/fake contracts', () => {
  const project = fixture();
  const contract = project.getSourceFileOrThrow('row.repository.ts');
  contract.replaceWithText('export interface DataPort { getAll(): Promise<string[]>; }');
  assert.ok(rules(project).includes('CPA-003'));
  contract.replaceWithText('interface Repository<T> { getAll(): Promise<T[]>; } export interface RowRepository extends Repository<string> {}');
  assert.ok(rules(project).includes('CPA-003'));
  contract.replaceWithText('export type RowRepository = { getAll(): Promise<string[]> };');
  assert.ok(rules(project).includes('CPA-003'));
});

void test('selection covers disconnected sources and contracts outside repository folders', () => {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/application/shared/hidden.ts'), `
    import type { Repository } from '@casepilot/abstractions';
    import type { Row } from '../../domain/entities/row.js';
    export interface DataPort extends Repository<Row> { find(filter: { id: string }): Promise<Row[]>; }
  `);
  assert.ok(validateDataAccess(project, apiDirectory).some(finding => finding.rule === 'BCK-021' && finding.file.endsWith('hidden.ts')));
  project.createSourceFile(resolve(apiDirectory, 'test/ignored.ts'), 'export interface TestRepository { anything(value: object): void; }');
  assert.ok(!validateDataAccess(project, apiDirectory).some(finding => finding.file.includes('ignored.ts')));
});

function transactionFixture(callback: string): Project {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/application/rows/write.ts'), `
    import type { UnitOfWork } from '@casepilot/abstractions';
    import type { RowRepository } from '../../domain/repositories/row.repository.js';
    interface Repositories { readonly rows: RowRepository }
    export interface RowUnitOfWork extends UnitOfWork<Repositories> {}
    export async function run(uow: RowUnitOfWork, global: RowRepository): Promise<number> {
      return uow.execute(async scope => { ${callback} });
    }
  `);
  return project;
}

void test('BCK-022 accepts scoped repository calls, aliases and destructuring', () => {
  for (const callback of [
    'return (await scope.rows.getAll()).length;',
    'const rows = scope.rows; return (await rows.getAll()).length;',
    'const { rows } = scope; return (await rows.getAll()).length;',
  ]) assert.deepEqual(validateDataAccess(transactionFixture(callback), apiDirectory), [], callback);
});

void test('BCK-022 rejects global/captured repositories and nested UnitOfWork', () => {
  for (const callback of [
    'return (await global.getAll()).length;',
    'const rows = global; return (await rows.getAll()).length;',
    'return uow.execute(async nested => (await nested.rows.getAll()).length);',
  ]) assert.ok(rules(transactionFixture(callback)).includes('BCK-022'), callback);
});

void test('BCK-022 resolves named callbacks and callback variable aliases', () => {
  const project = transactionFixture('return (await scope.rows.getAll()).length;');
  const source = project.getSourceFileOrThrow('write.ts');
  source.replaceWithText(source.getFullText().replace('return uow.execute(async scope => { return (await scope.rows.getAll()).length; });', `
    async function work(scope: Repositories): Promise<number> { return (await scope.rows.getAll()).length; }
    const alias = work;
    return uow.execute(alias);
  `));
  assert.deepEqual(validateDataAccess(project, apiDirectory), []);
  source.replaceWithText(source.getFullText().replace('scope.rows.getAll()', 'global.getAll()'));
  assert.ok(rules(project).includes('BCK-022'));
});

void test('BCK-022 rejects ORM resources in scopes and callbacks outside Application', () => {
  const project = transactionFixture('return 1;');
  const source = project.getSourceFileOrThrow('write.ts');
  source.replaceWithText(source.getFullText().replace('readonly rows: RowRepository', 'readonly rows: RowRepository; readonly manager: { query(sql: string): Promise<unknown> }'));
  assert.ok(rules(project).includes('BCK-022'));
  const other = transactionFixture('return 1;');
  other.getSourceFileOrThrow('write.ts').move(resolve(apiDirectory, 'src/infrastructure/write.ts'));
  assert.ok(rules(other).includes('BCK-022'));
});

void test('BCK-022 checks invocation location even when a callback is supplied indirectly', () => {
  const project = transactionFixture('return 1;');
  const source = project.getSourceFileOrThrow('write.ts');
  source.replaceWithText(source.getFullText().replace('global: RowRepository', 'work: (scope: Repositories) => Promise<number>').replace('return uow.execute(async scope => { return 1; });', 'return uow.execute(work);'));
  source.move(resolve(apiDirectory, 'src/infrastructure/write.ts'));
  assert.ok(rules(project).includes('BCK-022'));
});

void test('BCK-009/BCK-022 reject repository composition and UnitOfWork injection', () => {
  const project = fixture();
  project.createSourceFile(resolve(apiDirectory, 'src/infrastructure/persistence/repositories/row.ts'), `
    import type { UnitOfWork } from '@casepilot/abstractions';
    import type { RowRepository } from '../../../domain/repositories/row.repository.js';
    export class OtherRepository {
      constructor(private readonly other: RowRepository, private readonly uow: UnitOfWork<{ rows: RowRepository }>) {}
      async getAll(): Promise<readonly string[]> { await this.uow.execute(async scope => scope.rows.getAll()); return this.other.getAll().then(rows => rows.map(row => row.id)); }
    }
  `);
  assert.ok(rules(project).includes('BCK-009'));
  assert.ok(rules(project).includes('BCK-022'));
});

void test('real API repository is scanned and losing Entity heritage fails BCK-021', () => {
  const project = new Project({ tsConfigFilePath: resolve(actualApiDirectory, 'tsconfig.json') });
  assert.deepEqual(validateDataAccess(project, actualApiDirectory), []);
  const entity = project.getSourceFileOrThrow('health-check-object.ts');
  entity.getClassOrThrow('HealthCheckObject').removeImplements(0);
  const findings = validateDataAccess(project, actualApiDirectory);
  assert.ok(findings.some(finding => finding.rule === 'BCK-021' && finding.file.includes('health-check-object.repository.ts')));
});
