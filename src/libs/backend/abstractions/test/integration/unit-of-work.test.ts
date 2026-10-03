import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { after, before, beforeEach, test } from 'node:test';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource, EntitySchema, type EntityManager } from 'typeorm';
import { PageRequest, PageResponse, PersistenceError, StoredEntity, UnitOfWorkError, type CrudRepository, type Entity, type JsonValue } from '../../src/index.js';
import { TypeOrmUnitOfWork, TypeOrmDataRepository, sqlString, sqlInteger, sqlTimestamp, sqlJson, type SqlTable } from '../../src/dataaccess/typeorm/index.js';

class Row implements Entity<string> {
  constructor(public readonly id: string, public readonly value: string) {}
}

const firstSchema = new EntitySchema<Row>({
  name: 'UowFirst', tableName: 'UowFirst', columns: { id: { type: 'text', primary: true }, value: { type: 'text' } },
});
const secondSchema = new EntitySchema<Row>({
  name: 'UowSecond', tableName: 'UowSecond', columns: { id: { type: 'text', primary: true }, value: { type: 'text' } },
});

class TableRepository implements CrudRepository<Row> {
  constructor(private readonly manager: EntityManager, private readonly schema: EntitySchema<Row>) {}
  async getAll(): Promise<readonly Row[]> {
    const rows = await this.manager.find(this.schema, { order: { id: 'ASC' } });
    return rows.map(row => new Row(row.id, row.value));
  }
  async getById(id: string): Promise<Row | null> {
    const row = await this.manager.findOneBy(this.schema, { id });
    return row ? new Row(row.id, row.value) : null;
  }
  async add(entity: Row): Promise<void> { await this.manager.insert(this.schema, entity); }
  async update(entity: Row): Promise<boolean> {
    const result = await this.manager.update(this.schema, { id: entity.id }, { value: entity.value });
    return (result.affected ?? 0) > 0;
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.manager.delete(this.schema, { id });
    return (result.affected ?? 0) > 0;
  }
  count(): Promise<number> { return this.manager.count(this.schema); }
  async getPaged(request: PageRequest): Promise<PageResponse<Row>> {
    // Table names are owned fixture constants; page inputs are always parameters.
    const table = this.schema === firstSchema ? 'UowFirst' : 'UowSecond';
    const rows = await this.manager.query<{ total: string; items: { id: string; value: string }[] }[]>(`
      SELECT (SELECT count(*)::text FROM "${table}") AS total,
        COALESCE((SELECT json_agg(page) FROM
          (SELECT id, value FROM "${table}" ORDER BY id LIMIT $1 OFFSET $2) page), '[]'::json) AS items
    `, [request.pageSize, request.offset]);
    const row = rows[0];
    assert.ok(row);
    return new PageResponse(request, row.items.map(item => new Row(item.id, item.value)), Number(row.total));
  }
}

interface Repositories { readonly first: CrudRepository<Row>; readonly second: CrudRepository<Row> }
class InventoryRow extends StoredEntity {
  organizationId!: string;
  label!: string;
  payload!: JsonValue;
}
const inventorySchema = new EntitySchema<InventoryRow>({ name: 'InventoryFixture', columns: {
  id: { type: 'text', primary: true }, version: { type: 'integer' }, createdAt: { type: 'timestamptz' }, updatedAt: { type: 'timestamptz' },
  organizationId: { type: 'text' }, label: { type: 'text' }, payload: { type: 'jsonb' },
} });
const inventoryTable: SqlTable<InventoryRow> = {
  schema: inventorySchema, tableName: 'MechanismRows', scopeColumn: 'organization_key', idColumn: 'record_key', versionColumn: 'revision',
  immutableColumns: ['record_key', 'organization_key', 'inserted_at'],
  columns: [
    { property: 'id', name: 'record_key', value: entity => entity.id },
    { property: 'version', name: 'revision', value: entity => entity.version },
    { property: 'createdAt', name: 'inserted_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'edited_at', value: entity => entity.updatedAt },
    { property: 'organizationId', name: 'organization_key', value: entity => entity.organizationId },
    { property: 'label', name: 'display_label', value: entity => entity.label },
    { property: 'payload', name: 'payload', json: true, value: entity => entity.payload },
  ],
  read: row => Object.assign(new InventoryRow(), {
    id: sqlString(row.id), version: sqlInteger(row.version), createdAt: sqlTimestamp(row.createdAt), updatedAt: sqlTimestamp(row.updatedAt),
    organizationId: sqlString(row.organizationId), label: sqlString(row.label), payload: sqlJson(row.payload),
  }),
};
class InventoryRepository extends TypeOrmDataRepository<InventoryRow> {}
let container: StartedPostgreSqlContainer | undefined;
let source: DataSource;
let unitOfWork: TypeOrmUnitOfWork<Repositories>;

before(async () => {
  container = await new PostgreSqlContainer('postgres:18-bookworm')
    .withDatabase(`abstractions_test_${randomBytes(8).toString('hex')}`)
    .withUsername('abstractions_test').withPassword(randomBytes(24).toString('hex'))
    .withLabels({ 'com.casepilot.purpose': 'abstractions-tests' }).withStartupTimeout(120_000).start();
  source = new DataSource({
    type: 'postgres', host: container.getHost(), port: container.getPort(),
    database: container.getDatabase(), username: container.getUsername(), password: container.getPassword(),
    entities: [firstSchema, secondSchema], synchronize: false, migrationsRun: false,
  });
  await source.initialize();
  for (const table of ['UowFirst', 'UowSecond']) {
    await source.query(`CREATE TABLE "${table}" (id text PRIMARY KEY DEFERRABLE INITIALLY DEFERRED, value text NOT NULL)`);
  }
  unitOfWork = new TypeOrmUnitOfWork<Repositories>(() => Promise.resolve(source), manager => ({
    first: new TableRepository(manager, firstSchema), second: new TableRepository(manager, secondSchema),
  }));
});
beforeEach(async () => { await source.query('TRUNCATE TABLE "UowFirst", "UowSecond"'); });
after(async () => {
  try { if (source?.isInitialized) await source.destroy(); }
  finally { await container?.stop({ timeout: 10_000, remove: true, removeVolumes: true }); }
});

void test('commits two different repositories before returning the callback result', async () => {
  const result = await unitOfWork.execute(async repositories => {
    await repositories.first.add(new Row('one', 'first'));
    await repositories.second.add(new Row('two', 'second'));
    assert.equal((await repositories.first.getById('one'))?.value, 'first');
    return 'committed';
  }, 'READ COMMITTED');
  assert.equal(result, 'committed');
  assert.equal(await source.manager.count(firstSchema), 1);
  assert.equal(await source.manager.count(secondSchema), 1);
});

void test('shared SQL works with unrelated tables, custom identity/version/scope columns and Application-selected transactions', async () => {
  await source.query('CREATE TABLE "MechanismRows" (record_key text PRIMARY KEY, revision integer NOT NULL, inserted_at timestamptz NOT NULL, edited_at timestamptz NOT NULL, organization_key text NOT NULL, display_label text NOT NULL, payload jsonb NOT NULL)');
  const repository = new InventoryRepository(source.manager, inventoryTable);
  const record = (id: string, organizationId: string): InventoryRow => Object.assign(new InventoryRow(), {
    id, organizationId, version: 1, createdAt: '2026-10-02T00:00:00.000Z', updatedAt: '2026-10-02T00:00:00.000Z',
    label: "literal ' ; SELECT secret", payload: { nested: [true, null, 1] },
  });
  const first = await repository.add(record('one', 'organization-a'));
  await repository.add(record('two', 'organization-b'));
  assert.equal(await repository.getById('one', 'organization-b'), null);
  assert.equal(await repository.count('organization-a'), 1);
  assert.equal((await repository.getPage(new PageRequest(1, 10, 'label', 'asc'), 'organization-a'))[0]?.id, 'one');
  assert.deepEqual(first.payload, { nested: [true, null, 1] });
  await assert.rejects(repository.add(first), (error: unknown) => error instanceof PersistenceError && error.reason === 'unique' && error.cause instanceof Error);
  first.label = 'changed'; first.version = 2; first.organizationId = 'organization-b';
  assert.equal(await repository.update(first, 'organization-a', 0), null);
  const changed = await repository.update(first, 'organization-a', 1);
  assert.equal(changed?.organizationId, 'organization-a', 'The configured immutable scope column cannot change.');
  assert.equal(changed?.version, 2);
  assert.equal(await repository.delete('one', 'organization-a', 1), false);
  assert.equal(await repository.delete('one', 'organization-a', 2), true);
  const work = new TypeOrmUnitOfWork<{ readonly rows: InventoryRepository }>(() => Promise.resolve(source), manager => ({ rows: new InventoryRepository(manager, inventoryTable) }));
  const failure = new Error('Application rejected the write');
  await assert.rejects(work.execute(async repositories => { await repositories.rows.add(record('rollback', 'organization-a')); throw failure; }), error => error === failure);
  assert.equal(await repository.getById('rollback', 'organization-a'), null);
  await source.query('CREATE TABLE "GlobalMechanismRows" (LIKE "MechanismRows" INCLUDING ALL)');
  const global = new InventoryRepository(source.manager, { ...inventoryTable, tableName: 'GlobalMechanismRows', scopeColumn: null });
  await global.add(record('global', 'metadata-only'));
  assert.equal((await global.getById('global', null))?.id, 'global');
  await assert.rejects(global.getById('global', 'wrong-scope'));
  await assert.rejects(repository.getById('two', null));
});

void test('rolls back all repositories when the Application callback fails', async () => {
  const failure = new Error('Application rejected the operation');
  await assert.rejects(unitOfWork.execute(async repositories => {
    await repositories.first.add(new Row('one', 'first'));
    await repositories.second.add(new Row('two', 'second'));
    throw failure;
  }), error => error === failure);
  assert.equal(await source.manager.count(firstSchema), 0);
  assert.equal(await source.manager.count(secondSchema), 0);
});

void test('a database failure rolls back prior repository writes and permits the next execution', async () => {
  await assert.rejects(unitOfWork.execute(async repositories => {
    await repositories.first.add(new Row('one', 'first'));
    await repositories.second.add(new Row('two', 'invalid\u0000text'));
  }));
  assert.equal(await source.manager.count(firstSchema), 0);
  await unitOfWork.execute(async repositories => { await repositories.first.add(new Row('after', 'healthy')); });
  assert.equal(await source.manager.count(firstSchema), 1);
});

void test('rejects a commit failure even when the callback returned successfully', async () => {
  let callbackCompleted = false;
  await assert.rejects(unitOfWork.execute(async repositories => {
    await repositories.first.add(new Row('one', 'first'));
    await repositories.second.add(new Row('duplicate', 'a'));
    await repositories.second.add(new Row('duplicate', 'b'));
    callbackCompleted = true;
    return 'must never be delivered';
  }), UnitOfWorkError);
  assert.equal(callbackCompleted, true, 'The deferred constraint fails during commit, after callback completion.');
  assert.equal(await source.manager.count(firstSchema), 0);
  assert.equal(await source.manager.count(secondSchema), 0);
});

void test('concurrent scopes use different repositories and one rollback cannot undo the other commit', async () => {
  const firstReady = barrier();
  const secondReady = barrier();
  let firstRepository: CrudRepository<Row> | undefined;
  const failing = unitOfWork.execute(async repositories => {
    firstRepository = repositories.first;
    try { await repositories.first.add(new Row('rollback', 'first scope')); }
    finally { firstReady.release(); }
    await secondReady.promise;
    throw new Error('rollback first scope');
  });
  const committed = unitOfWork.execute(async repositories => {
    await firstReady.promise;
    try {
      assert.notEqual(repositories.first, firstRepository);
      await repositories.first.add(new Row('commit', 'second scope'));
      await repositories.second.add(new Row('commit', 'second scope'));
    } finally { secondReady.release(); }
    return 'second scope';
  });
  const results = await Promise.allSettled([failing, committed]);
  assert.equal(results[0]?.status, 'rejected');
  assert.equal(results[1]?.status, 'fulfilled');
  assert.equal(await source.manager.count(firstSchema), 1);
  assert.equal(await source.manager.count(secondSchema), 1);
  assert.equal((await source.manager.findOneBy(firstSchema, { id: 'commit' }))?.value, 'second scope');
});

function barrier(): { readonly promise: Promise<void>; readonly release: () => void } {
  let release: () => void = () => { throw new Error('Barrier not initialized.'); };
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

void test('CRUD and a single-statement page handle empty, populated and out-of-range results', async () => {
  await unitOfWork.execute(async repositories => {
    assert.equal(await repositories.first.getById('missing'), null);
    assert.equal((await repositories.first.getPaged(new PageRequest())).totalPages, 0);
    await repositories.first.add(new Row('a', 'old'));
    await repositories.first.add(new Row('b', 'second'));
    assert.equal(await repositories.first.update(new Row('a', 'new')), true);
    assert.equal(await repositories.first.update(new Row('missing', 'new')), false);
    assert.equal((await repositories.first.getById('a'))?.value, 'new');
    assert.equal((await repositories.first.getAll()).length, 2);
    assert.equal(await repositories.first.count(), 2);
    const page = await repositories.first.getPaged(new PageRequest(1, 1));
    assert.equal(page.items[0]?.id, 'a');
    assert.equal(page.totalCount, 2);
    assert.equal(page.hasNextPage, true);
    const outside = await repositories.first.getPaged(new PageRequest(8, 1));
    assert.deepEqual(outside.items, []);
    assert.equal(outside.totalCount, 2);
    assert.equal(await repositories.first.delete('a'), true);
    assert.equal(await repositories.first.delete('a'), false);
  });
});
