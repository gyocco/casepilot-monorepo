import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PersistenceError, UnexpectedError, UnitOfWorkError, runPersistence } from '../../src/index.js';
import { systemCrudRuntime } from '../../src/node/index.js';

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
