import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { after, before, beforeEach, test } from 'node:test';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource, EntitySchema, type EntityManager } from 'typeorm';
import { PageRequest, PageResponse, UnitOfWorkError, type CrudRepository, type Entity } from '../../src/index.js';
import { TypeOrmUnitOfWork } from '../../src/dataaccess/typeorm/index.js';

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
