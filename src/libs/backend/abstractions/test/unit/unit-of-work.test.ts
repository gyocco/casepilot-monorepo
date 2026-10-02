import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UnitOfWorkError, type Repository } from '../../src/index.js';
import { TypeOrmUnitOfWork } from '../../src/dataaccess/typeorm/index.js';

void test('connection failure exposes only the technical contract without executing the callback', async () => {
  const original = new Error('Private driver detail');
  let called = false;
  const uow = new TypeOrmUnitOfWork<{ rows: Repository }>(
    () => Promise.reject(original),
    () => { throw new Error('The factory must not run.'); },
  );
  await assert.rejects(uow.execute(() => { called = true; return Promise.resolve('result'); }), error => {
    assert.ok(error instanceof UnitOfWorkError);
    assert.equal(error.message, 'The transaction could not complete.');
    assert.equal(error.cause, undefined);
    return true;
  });
  assert.equal(called, false);
});
