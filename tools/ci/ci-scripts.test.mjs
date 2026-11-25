import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { buildWebAppConfig, writeWebAppConfig } from './generate-web-app-config.mjs';
import { prepareFirebaseHostingConfig } from './prepare-firebase-hosting-config.mjs';
import { runApiSmokeTests } from './smoke-test-api.mjs';
import { runWebSmokeTests } from './smoke-test-web.mjs';

const validWebEnv = {
  WEB_ENVIRONMENT: 'development',
  DEV_API_URL: 'https://casepilot-api-dev-example.a.run.app/',
  FIREBASE_WEB_API_KEY: 'AIzaSyExamplePublicKeyForTests',
  FIREBASE_WEB_AUTH_DOMAIN: 'casepilot-dev.firebaseapp.com',
  FIREBASE_WEB_PROJECT_ID: 'casepilot-dev',
  FIREBASE_WEB_APP_ID: '1:123456789012:web:abcdef123456',
};

void test('generate-web-app-config builds valid DEV public config with null emulator and writes JSON', context => {
  const dir = mkdtempSync(join(tmpdir(), 'casepilot-ci-web-config-'));
  context.after(() => rmSync(dir, { recursive: true, force: true }));
  const outputPath = join(dir, 'app-config.json');

  const result = writeWebAppConfig({ ...validWebEnv, OUTPUT_PATH: outputPath });
  assert.deepEqual(result.config, {
    environment: 'development',
    apiBaseUrl: 'https://casepilot-api-dev-example.a.run.app',
    firebase: {
      apiKey: 'AIzaSyExamplePublicKeyForTests',
      authDomain: 'casepilot-dev.firebaseapp.com',
      projectId: 'casepilot-dev',
      appId: '1:123456789012:web:abcdef123456',
    },
    authEmulatorUrl: null,
  });

  const written = JSON.parse(readFileSync(outputPath, 'utf8'));
  assert.deepEqual(written, result.config);
});

void test('generate-web-app-config rejects local environment, HTTP URLs, loopback hosts and demo placeholders', () => {
  assert.throws(() => buildWebAppConfig({ ...validWebEnv, WEB_ENVIRONMENT: 'local' }), /development, staging, or production/);
  assert.throws(() => buildWebAppConfig({ ...validWebEnv, DEV_API_URL: 'http://casepilot-api.example.com' }), /HTTPS/);
  assert.throws(() => buildWebAppConfig({ ...validWebEnv, DEV_API_URL: 'https://127.0.0.1:3000' }), /loopback/);
  assert.throws(() => buildWebAppConfig({ ...validWebEnv, FIREBASE_WEB_PROJECT_ID: 'demo-casepilot-local' }), /placeholder/);
  assert.throws(() => buildWebAppConfig({ ...validWebEnv, FIREBASE_WEB_API_KEY: '' }), /FIREBASE_WEB_API_KEY/);
});

void test('prepare-firebase-hosting-config injects site ID and preserves rewrites, headers and public path', context => {
  const dir = mkdtempSync(join(tmpdir(), 'casepilot-ci-firebase-'));
  context.after(() => rmSync(dir, { recursive: true, force: true }));
  const outputConfigPath = join(dir, 'firebase.dev.generated.json');
  const sourceConfigPath = resolve('deploy/dev/firebase.json');

  const { config } = prepareFirebaseHostingConfig({
    sourceConfigPath,
    outputConfigPath,
    siteId: 'casepilot-dev-web',
  });

  assert.equal(config.hosting.site, 'casepilot-dev-web');
  assert.equal(config.hosting.rewrites[0].destination, '/index.html');
  assert.ok(config.hosting.headers.some(entry => entry.source === '/app-config.json'));
  assert.throws(
    () => prepareFirebaseHostingConfig({ sourceConfigPath, outputConfigPath, siteId: 'INVALID SITE!' }),
    /FIREBASE_HOSTING_SITE/,
  );
});

void test('smoke-test-api verifies /health, /health/database and unauthenticated 401 /auth/me with retries', async context => {
  let dbCalls = 0;
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    if (req.url === '/health/database') {
      dbCalls += 1;
      if (dbCalls === 1) {
        // Simulate transient cold start failure on first attempt
        res.writeHead(500, { 'Content-Type': 'application/problem+json' });
        res.end(JSON.stringify({ code: 'UNEXPECTED_ERROR' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ status: 'ok', objects: [{ guid: '00000000-0000-4000-8000-000000000001', value: 'CasePilot API' }] }));
      return;
    }
    if (req.url === '/auth/me') {
      res.writeHead(401, { 'Content-Type': 'application/problem+json; charset=utf-8' });
      res.end(JSON.stringify({ status: 401, code: 'UNAUTHORIZED_ERROR' }));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(resolvePromise => server.listen(0, '127.0.0.1', resolvePromise));
  context.after(() => server.close());
  const { port } = server.address();

  await runApiSmokeTests({
    apiBaseUrl: `http://127.0.0.1:${port}`,
    retries: 3,
    retryDelayMs: 10,
    timeoutMs: 2000,
  });
  assert.equal(dbCalls, 2);
});

void test('smoke-test-web verifies root shell, no-store app-config.json and SPA route rewrite', async context => {
  const server = createServer((req, res) => {
    if (req.url === '/' || req.url === '/auth/login') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end('<!doctype html><html><body><cp-root></cp-root></body></html>');
      return;
    }
    if (req.url === '/app-config.json') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      });
      res.end(JSON.stringify(buildWebAppConfig(validWebEnv)));
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(resolvePromise => server.listen(0, '127.0.0.1', resolvePromise));
  context.after(() => server.close());
  const { port } = server.address();

  await runWebSmokeTests({
    webBaseUrl: `http://127.0.0.1:${port}`,
    expectedEnvironment: 'development',
    expectedApiBaseUrl: 'https://casepilot-api-dev-example.a.run.app',
    retries: 2,
    retryDelayMs: 10,
    timeoutMs: 2000,
  });
});
