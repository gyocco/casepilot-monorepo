import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProblemDetails } from '@casepilot/exception-handler/nestjs';
import { createApp } from '../../src/create-app.js';
import { GetHealthCheckObjectsHandler, HealthDatabaseUnavailableError } from '../../src/application/health/get-health-check-objects.handler.js';
import type { BackendConfig } from '../../src/infrastructure/config/backend-config.js';

for (const exposeErrorDetails of [false, true]) {
  void test(`API composition uses the global handler and keeps Health 503 sanitized (details=${exposeErrorDetails})`, async context => {
    const config: BackendConfig = {
      environment: 'test',
      http: { host: '127.0.0.1', port: 0, corsOrigins: [], exposeErrorDetails },
      database: { host: '127.0.0.1', port: 1, database: 'unused', username: 'unused', password: 'synthetic',
        schema: 'public', ssl: false, connectTimeoutMs: 10, queryTimeoutMs: 10, poolSize: 1 },
    };
    const app = await createApp(config, false);
    context.after(() => app.close());
    // Replace only the operation under test; no database connection or local config is accessed.
    app.get(GetHealthCheckObjectsHandler).execute = () => Promise.reject(new HealthDatabaseUnavailableError('private provider failure'));
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    for (const [path, status, code] of [
      ['/health/database', 503, 'DATABASE_UNAVAILABLE'], ['/missing', 404, 'NOT_FOUND_ERROR'],
    ] as const) {
      const response = await fetch(`${url}${path}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, status);
      assert.match(response.headers.get('content-type') ?? '', /^application\/problem\+json\b/);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.json() as ProblemDetails;
      assert.equal(body.status, status);
      assert.equal(body.code, code);
      assert.equal(body.type, 'about:blank');
      assert.match(body.instance, /^urn:uuid:/);
      if (status === 503 || !exposeErrorDetails) assert.equal(body.detail, undefined);
      assert.doesNotMatch(JSON.stringify(body), /private|provider/);
    }
    const live = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    assert.equal(live.status, 200);
    assert.deepEqual(await live.json(), { status: 'ok' });
  });
}
