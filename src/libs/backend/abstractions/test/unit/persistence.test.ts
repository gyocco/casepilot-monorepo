import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DataSource, QueryFailedError } from 'typeorm';
import { PersistenceError, UnexpectedError, UnitOfWorkError, runPersistence } from '../../src/index.js';
import { DatabaseConnection, normalizeSqlError, sqlRows, sqlInteger, sqlJson, sqlTimestamp, sqlChoice } from '../../src/dataaccess/typeorm/index.js';
import { systemCrudRuntime } from '../../src/node/index.js';

void test('normalizes provider codes without losing cause or a normalized failure identity', () => {
  for (const [code, reason] of [['23505', 'unique'], ['23503', 'reference'], ['23502', 'required'], ['40001', 'concurrent'], ['40P01', 'concurrent'], ['XX000', 'unavailable']]) {
    const driver = Object.assign(new Error('Private provider diagnostic'), { code });
    const failure = new QueryFailedError('private query', [], driver);
    const error = normalizeSqlError(failure);
    assert.equal(error.reason, reason);
    assert.equal(error.cause, failure);
    assert.equal(error.message, 'Persistence operation failed.');
    assert.equal(normalizeSqlError(error), error);
  }
});

void test('SQL conversion rejects invalid persisted data and unwraps affected-row tuples', () => {
  const rows = [{ id: 'one' }];
  assert.equal(sqlRows(rows), rows);
  assert.equal(sqlRows([rows, 1]), rows);
  for (const operation of [() => sqlRows({}), () => sqlInteger('1'), () => sqlJson(Number.NaN), () => sqlChoice('bad', ['good'])]) {
    assert.throws(operation, (error: unknown) => error instanceof PersistenceError && error.reason === 'invalid-data');
  }
  assert.equal(sqlTimestamp(new Date('2026-10-02T00:00:00Z')), '2026-10-02T00:00:00.000Z');
});

void test('each Application chooses its persistence policy; unrelated errors pass through', async () => {
  const technical = new PersistenceError('unique');
  const firstPolicy = new UnexpectedError('Chosen by the consumer', { cause: technical });
  await assert.rejects(runPersistence(() => Promise.reject(technical), () => firstPolicy), error => error === firstPolicy);
  const otherPolicy = new Error('A different application outcome');
  await assert.rejects(runPersistence(() => Promise.reject(technical), () => otherPolicy), error => error === otherPolicy);
  const unrelated = new Error('Application failure');
  await assert.rejects(runPersistence(() => Promise.reject(unrelated), () => firstPolicy), error => error === unrelated);
  await assert.rejects(runPersistence(() => Promise.reject(new UnitOfWorkError()), () => firstPolicy), error => error === firstPolicy);
  assert.equal(await runPersistence(() => Promise.resolve('success'), () => firstPolicy), 'success');
});

void test('Node runtime adapter supplies UUIDs and ISO dates through its pure port', () => {
  assert.match(systemCrudRuntime.newId(), /^[0-9a-f-]{36}$/i);
  const timestamp = systemCrudRuntime.now();
  assert.equal(new Date(timestamp).toISOString(), timestamp);
});

void test('deferred connections share initialization, retry failed attempts and close before reuse', async context => {
  const source = new DataSource({ type: 'postgres', synchronize: false });
  let finish!: (source: DataSource) => void;
  const pending = new Promise<DataSource>(resolve => { finish = resolve; });
  const initialize = context.mock.method(source, 'initialize', () => pending);
  const destroy = context.mock.method(source, 'destroy', () => Promise.resolve());
  const connection = new DatabaseConnection(source);
  const first = connection.getDataSource(), second = connection.getDataSource();
  assert.equal(initialize.mock.callCount(), 1);
  Reflect.set(source, 'isInitialized', true);
  finish(source);
  assert.deepEqual(await Promise.all([first, second]), [source, source]);
  await connection.onModuleDestroy();
  assert.equal(destroy.mock.callCount(), 1);
  await assert.rejects(connection.getDataSource(), /closing/);

  const retrySource = new DataSource({ type: 'postgres', synchronize: false });
  const retryInitialize = context.mock.method(retrySource, 'initialize', () => Promise.reject(new Error('Unavailable')));
  const retry = new DatabaseConnection(retrySource);
  await assert.rejects(retry.getDataSource(), /Unavailable/);
  retryInitialize.mock.mockImplementation(() => Promise.resolve(retrySource));
  assert.equal(await retry.getDataSource(), retrySource);
  assert.equal(retryInitialize.mock.callCount(), 2);
  await retry.onModuleDestroy();
});
