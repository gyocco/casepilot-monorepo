import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, type TestContext } from 'node:test';
import { BackendConfigurationError, loadBackendConfig } from '../../src/infrastructure/config/load-backend-config.js';

function fixture(context: TestContext): string {
  const root = mkdtempSync(join(tmpdir(), 'casepilot-api-config-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const app = join(root, 'src', 'apps', 'casepilot', 'casepilot-api');
  mkdirSync(app, { recursive: true });
  mkdirSync(join(root, 'infra', 'docker'), { recursive: true });
  writeFileSync(join(root, 'infra', 'docker', '.env'), [
    'CASEPILOT_POSTGRES_PORT=55432', 'CASEPILOT_POSTGRES_DB=local_db',
    'CASEPILOT_POSTGRES_USER=local_user', 'CASEPILOT_POSTGRES_PASSWORD=local_fixture_secret',
  ].join('\n'));
  return app;
}

const remote = {
  APP_ENV: 'staging', DATABASE_HOST: 'db.example.test', DATABASE_PORT: '5432',
  DATABASE_NAME: 'staging_db', DATABASE_USER: 'staging_user', DATABASE_PASSWORD: 'remote_fixture_secret',
  AUTH_FIREBASE_PROJECT_ID: 'casepilot-staging',
};

void test('local configuration reads Docker credentials and applies file/process precedence', context => {
  const app = fixture(context);
  writeFileSync(join(app, '.env'), 'APP_ENV=local\nAPI_PORT=3001\nDATABASE_NAME=common_db');
  writeFileSync(join(app, '.env.local'), 'API_PORT=3002\nDATABASE_NAME=specific_db');
  const config = loadBackendConfig({ API_PORT: '3003' }, app);
  assert.equal(config.environment, 'local');
  assert.equal(config.http.port, 3003);
  assert.equal(config.database.database, 'specific_db');
  assert.equal(config.database.host, '127.0.0.1');
  assert.equal(config.database.port, 55432);
  assert.equal(config.database.password, 'local_fixture_secret');
  assert.equal(config.database.ssl, false);
});

void test('non-local environments never fall back to Docker credentials and enable verified TLS', context => {
  const app = fixture(context);
  assert.throws(() => loadBackendConfig({ APP_ENV: 'staging' }, app), BackendConfigurationError);
  const config = loadBackendConfig(remote, app);
  assert.equal(config.http.host, '0.0.0.0');
  assert.deepEqual(config.database.ssl, { rejectUnauthorized: true });
  assert.equal(config.database.password, 'remote_fixture_secret');
  assert.throws(() => loadBackendConfig({ NODE_ENV: 'production' }, app), /APP_ENV must be explicitly/);
});

void test('a PostgreSQL URL overrides discrete connection fields without leaking credentials on error', context => {
  const app = fixture(context);
  const config = loadBackendConfig({
    ...remote, DATABASE_URL: 'postgresql://url_user:encoded%40secret@db.example.test:5444/url_db',
  }, app);
  assert.equal(config.database.username, 'url_user');
  assert.equal(config.database.password, 'encoded@secret');
  assert.equal(config.database.database, 'url_db');
  assert.equal(config.database.port, 5444);
  assert.throws(
    () => loadBackendConfig({ ...remote, DATABASE_URL: 'postgres://user:sensitive_secret@host/db?sslmode=disable' }, app),
    (error: unknown) => error instanceof BackendConfigurationError && !error.message.includes('sensitive_secret'),
  );
});

void test('invalid configuration is rejected before opening a connection or HTTP port', context => {
  const app = fixture(context);
  for (const invalid of [
    { API_PORT: '0' }, { API_PORT: '3000junk' }, { DATABASE_POOL_SIZE: '0' },
    { DATABASE_SCHEMA: 'public;DROP TABLE test' }, { DATABASE_SSL: 'yes' },
    { DATABASE_PASSWORD: 'REPLACE_WITH_PASSWORD' }, { CORS_ORIGINS: '*' },
    { CORS_ORIGINS: 'https://example.test/path' }, { APP_ENV: 'unknown' },
    { DATABASE_SSL_CA_FILE: 'relative-ca.pem' }, { API_ERROR_DETAILS: 'yes' }, { API_ERROR_DETAILS: 'TRUE' },
  ]) {
    assert.throws(() => loadBackendConfig({ ...remote, ...invalid }, app), BackendConfigurationError);
  }
  writeFileSync(join(app, '.env.staging'), 'APP_ENV=production');
  assert.throws(() => loadBackendConfig(remote, app), /cannot change/);
});

void test('error detail policy has environment defaults and honors explicit overrides and precedence', context => {
  const app = fixture(context);
  for (const APP_ENV of ['local', 'test', 'development', 'staging', 'production']) {
    const variables = { ...remote, APP_ENV };
    assert.equal(loadBackendConfig(variables, app).http.exposeErrorDetails, ['local', 'test', 'development'].includes(APP_ENV));
    assert.equal(loadBackendConfig({ ...variables, API_ERROR_DETAILS: 'false' }, app).http.exposeErrorDetails, false);
    assert.equal(loadBackendConfig({ ...variables, API_ERROR_DETAILS: 'true' }, app).http.exposeErrorDetails, true);
  }
  writeFileSync(join(app, '.env'), 'API_ERROR_DETAILS=true');
  writeFileSync(join(app, '.env.staging'), 'API_ERROR_DETAILS=false');
  assert.equal(loadBackendConfig(remote, app).http.exposeErrorDetails, false);
  assert.equal(loadBackendConfig({ ...remote, API_ERROR_DETAILS: 'true' }, app).http.exposeErrorDetails, true);
});

void test('CORS accepts only the explicitly configured origins and custom CA keeps verification enabled', context => {
  const app = fixture(context);
  const caPath = join(app, 'test-ca.pem');
  writeFileSync(caPath, 'fixture-ca');
  const config = loadBackendConfig({
    ...remote, CORS_ORIGINS: 'https://web.example.test,http://localhost:5173', DATABASE_SSL_CA_FILE: caPath,
  }, app);
  assert.deepEqual(config.http.corsOrigins, ['https://web.example.test', 'http://localhost:5173']);
  assert.deepEqual(config.database.ssl, { rejectUnauthorized: true, ca: 'fixture-ca' });
  assert.equal(config.auth.firebaseProjectId, 'casepilot-staging');
  assert.equal(config.auth.emulatorHost, null);
});

void test('auth configuration defaults to local emulator and forbids emulator outside local', context => {
  const app = fixture(context);
  const localConfig = loadBackendConfig({}, app);
  assert.equal(localConfig.auth.firebaseProjectId, 'demo-casepilot-local');
  assert.equal(localConfig.auth.emulatorHost, '127.0.0.1:9099');

  assert.throws(
    () => loadBackendConfig({ ...remote, AUTH_FIREBASE_PROJECT_ID: undefined }, app),
    BackendConfigurationError,
  );
  assert.throws(
    () => loadBackendConfig({ ...remote, FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099' }, app),
    /only in the local environment/,
  );
  assert.throws(
    () => loadBackendConfig({ FIREBASE_AUTH_EMULATOR_HOST: 'http://127.0.0.1:9099' }, app),
    /host:port/,
  );
});
