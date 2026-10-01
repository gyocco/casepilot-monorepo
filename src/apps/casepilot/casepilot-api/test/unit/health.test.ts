import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GetHealthCheckObjectsQuery, HealthDatabaseUnavailableError } from '../../src/contexts/health/application/queries/get-health-check-objects.query.js';
import { GetHealthCheckObjectsRequest } from '../../src/contexts/health/application/queries/get-health-check-objects.request.js';
import { GetHealthCheckObjectsResponse } from '../../src/contexts/health/application/queries/get-health-check-objects.response.js';
import { HealthCheckObject } from '../../src/contexts/health/domain/entities/health-check-object.js';
import { HealthCheckObjectRepositoryUnavailableError } from '../../src/contexts/health/domain/repositories/health-check-object.repository.js';

void test('Application reads once and maps Domain entities into its own response object', async () => {
  const entity = new HealthCheckObject('00000000-0000-4000-8000-000000000001', 'fixture');
  let reads = 0;
  const query = new GetHealthCheckObjectsQuery({
    getAll: () => { reads += 1; return Promise.resolve([entity]); },
  });
  const response = await query.execute(new GetHealthCheckObjectsRequest());
  assert.ok(response instanceof GetHealthCheckObjectsResponse);
  assert.equal(reads, 1);
  assert.equal(response.status, 'ok');
  assert.deepEqual({ ...response.objects[0] }, { guid: entity.guid, value: entity.value });
  assert.notEqual(response.objects[0], entity);
});

void test('an empty table returns a response with an empty collection', async () => {
  const query = new GetHealthCheckObjectsQuery({ getAll: () => Promise.resolve([]) });
  const response = await query.execute(new GetHealthCheckObjectsRequest());
  assert.deepEqual(response.objects, []);
  assert.equal(response.status, 'ok');
});

void test('Application translates persistence unavailability but does not hide unexpected errors', async () => {
  const unavailable = new GetHealthCheckObjectsQuery({
    getAll: () => Promise.reject(new HealthCheckObjectRepositoryUnavailableError('driver failure')),
  });
  await assert.rejects(unavailable.execute(new GetHealthCheckObjectsRequest()), HealthDatabaseUnavailableError);
  const unexpected = new Error('unexpected');
  const faulty = new GetHealthCheckObjectsQuery({ getAll: () => Promise.reject(unexpected) });
  await assert.rejects(faulty.execute(new GetHealthCheckObjectsRequest()), error => error === unexpected);
});
