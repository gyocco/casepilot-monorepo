import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it, test } from 'node:test';
import { migratedHealthObject, startApiFixture, type ApiFixture } from './support/api-fixture.js';

function assertJsonResponse(response: Response, status: number): void {
  assert.equal(response.status, status);
  assert.match(response.headers.get('content-type') ?? '', /^application\/json\b/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
}

void describe('CasePilot API health endpoints with isolated PostgreSQL', { concurrency: false }, () => {
  let fixture: ApiFixture;

  before(async () => { fixture = await startApiFixture(); }, { timeout: 180_000 });
  after(async () => { if (fixture) await fixture.close(); }, { timeout: 60_000 });
  beforeEach(() => fixture.resetHealthObjects(), { timeout: 10_000 });

  void it('GET /health returns the HTTP liveness contract', { timeout: 10_000 }, async () => {
    const response = await fixture.get('/health');
    assertJsonResponse(response, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  void it('GET /health/database reads records through the migrated PostgreSQL database', { timeout: 10_000 }, async () => {
    const response = await fixture.get('/health/database');
    assertJsonResponse(response, 200);
    assert.deepEqual(await response.json(), { status: 'ok', objects: [migratedHealthObject] });
    assert.equal(await fixture.database.showMigrations(), false);
  });

  void it('GET /health/database reads current values, sorts by GUID and does not change persisted data', { timeout: 10_000 }, async () => {
    const first = { guid: '00000000-0000-4000-8000-000000000002', value: 'First endpoint fixture' };
    const second = { guid: '00000000-0000-4000-8000-000000000003', value: 'Second endpoint fixture' };
    await fixture.resetHealthObjects([second, first]);

    const response = await fixture.get('/health/database');
    assertJsonResponse(response, 200);
    assert.deepEqual(await response.json(), { status: 'ok', objects: [first, second] });
    const persisted: unknown = await fixture.database.query('SELECT "Guid", "Value" FROM "HealthCheckObject" ORDER BY "Guid"');
    assert.deepEqual(persisted, [
      { Guid: first.guid, Value: first.value }, { Guid: second.guid, Value: second.value },
    ]);
  });

  void it('GET /health/database returns an empty collection for an empty table', { timeout: 10_000 }, async () => {
    await fixture.resetHealthObjects([]);
    const response = await fixture.get('/health/database');
    assertJsonResponse(response, 200);
    assert.deepEqual(await response.json(), { status: 'ok', objects: [] });
  });

  void it('GET /health/database supports concurrent HTTP requests', { timeout: 10_000 }, async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => fixture.get('/health/database')));
    for (const response of responses) {
      assertJsonResponse(response, 200);
      assert.deepEqual(await response.json(), { status: 'ok', objects: [migratedHealthObject] });
    }
  });

  void it('a missing table returns a sanitized 503, keeps liveness available and recovers after migration', { timeout: 15_000 }, async () => {
    await fixture.database.undoLastMigration({ transaction: 'all' });
    try {
      const unavailable = await fixture.get('/health/database');
      assertJsonResponse(unavailable, 503);
      assert.deepEqual(await unavailable.json(), { status: 'unavailable' });
      const live = await fixture.get('/health');
      assertJsonResponse(live, 200);
      assert.deepEqual(await live.json(), { status: 'ok' });
    } finally {
      await fixture.database.runMigrations({ transaction: 'all' });
    }
    const recovered = await fixture.get('/health/database');
    assertJsonResponse(recovered, 200);
    assert.deepEqual(await recovered.json(), { status: 'ok', objects: [migratedHealthObject] });
  });
});

void test('the API starts with its PostgreSQL container stopped: liveness is 200 and database checks are 503', { timeout: 180_000 }, async context => {
  const fixture = await startApiFixture({ stopDatabaseBeforeApiStart: true });
  context.after(() => fixture.close(), { timeout: 60_000 });

  const live = await fixture.get('/health');
  assertJsonResponse(live, 200);
  assert.deepEqual(await live.json(), { status: 'ok' });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const unavailable = await fixture.get('/health/database');
    assertJsonResponse(unavailable, 503);
    assert.deepEqual(await unavailable.json(), { status: 'unavailable' });
  }
  const stillLive = await fixture.get('/health');
  assertJsonResponse(stillLive, 200);
  assert.deepEqual(await stillLive.json(), { status: 'ok' });
});
