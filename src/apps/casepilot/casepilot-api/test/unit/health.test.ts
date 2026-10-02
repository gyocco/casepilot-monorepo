import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UnexpectedError } from '@casepilot/abstractions';
import { GetHealthCheckObjectsHandler } from '../../src/application/health/get-health-check-objects.handler.js';
import { GetHealthCheckObjectsRequest } from '../../src/application/health/get-health-check-objects.request.js';
import { GetHealthCheckObjectsResponse } from '../../src/application/health/get-health-check-objects.response.js';
import { HealthCheckObject } from '../../src/domain/entities/health-check-object.js';
import { HealthCheckObjectRepositoryUnavailableError } from '../../src/domain/repositories/health-check-object.repository.js';

void test('Application reads once and maps Domain entities into its own response object', async () => {
  const entity = new HealthCheckObject('00000000-0000-4000-8000-000000000001', 'fixture');
  let reads = 0;
  const query = new GetHealthCheckObjectsHandler({
    getAll: () => { reads += 1; return Promise.resolve([entity]); },
  });
  const response = await query.execute(new GetHealthCheckObjectsRequest());
  assert.ok(response instanceof GetHealthCheckObjectsResponse);
  assert.equal(reads, 1);
  assert.deepEqual({ ...response.objects[0] }, { guid: entity.guid, value: entity.value });
  assert.notEqual(response.objects[0], entity);
});

void test('an empty table returns a response with an empty collection', async () => {
  const query = new GetHealthCheckObjectsHandler({ getAll: () => Promise.resolve([]) });
  const response = await query.execute(new GetHealthCheckObjectsRequest());
  assert.deepEqual(response.objects, []);
});

void test('Application translates persistence unavailability to shared UnexpectedError and preserves other failures', async () => {
  const unavailable = new GetHealthCheckObjectsHandler({
    getAll: () => Promise.reject(new HealthCheckObjectRepositoryUnavailableError('driver failure')),
  });
  await assert.rejects(unavailable.execute(new GetHealthCheckObjectsRequest()), (error: unknown) => {
    assert.ok(error instanceof UnexpectedError);
    assert.equal(error.code, 'UNEXPECTED_ERROR');
    assert.equal(error.message, 'An unexpected error occurred.');
    assert.equal(error.cause, undefined);
    return true;
  });
  const unexpected = new Error('unexpected');
  const faulty = new GetHealthCheckObjectsHandler({ getAll: () => Promise.reject(unexpected) });
  await assert.rejects(faulty.execute(new GetHealthCheckObjectsRequest()), error => error === unexpected);
});
