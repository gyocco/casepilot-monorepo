import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { test } from 'node:test';
import {
  buildExternalLaunchSpecs,
  isHttpOk,
  isPortOpen,
  parseCliArgs,
  parseEnvContent,
  planStartupActions,
  probeEnvironment,
  resolveEndpoints,
} from './dev-local.mjs';

void test('parseCliArgs parses supported flags and rejects unknown flags', () => {
  assert.deepEqual(parseCliArgs([]), {
    inline: false,
    skipSeed: false,
    skipMigrate: false,
    forceInfra: false,
    noWait: false,
    help: false,
  });

  assert.deepEqual(parseCliArgs(['--inline', '--skip-seed', '--force-infra', '--no-wait']), {
    inline: true,
    skipSeed: true,
    skipMigrate: false,
    forceInfra: true,
    noWait: true,
    help: false,
  });

  assert.throws(() => parseCliArgs(['--unknown-flag']), /Unknown option/);
});

void test('parseEnvContent and resolveEndpoints honor docker env defaults and overrides', () => {
  const parsed = parseEnvContent([
    '# comment',
    'CASEPILOT_POSTGRES_PORT=56000',
    'CASEPILOT_FIREBASE_AUTH_EMULATOR_PORT=9199',
    'CASEPILOT_FIREBASE_EMULATOR_UI_PORT=4001',
  ].join('\n'));

  const endpoints = resolveEndpoints(parsed, { CASEPILOT_API_PORT: '3100', CASEPILOT_WEB_PORT: '4300' });
  assert.equal(endpoints.postgresPort, 56000);
  assert.equal(endpoints.authEmulatorPort, 9199);
  assert.equal(endpoints.authEmulatorUiPort, 4001);
  assert.equal(endpoints.apiPort, 3100);
  assert.equal(endpoints.webPort, 4300);
  assert.equal(endpoints.apiOrigin, 'http://127.0.0.1:3100');
  assert.equal(endpoints.webOrigin, 'http://127.0.0.1:4300');
});

void test('planStartupActions is idempotent when all services are already running', () => {
  const plan = planStartupActions(
    {
      postgresUp: true,
      authEmulatorUp: true,
      apiPortOpen: true,
      apiDbHealthy: true,
      webUp: true,
    },
    parseCliArgs([]),
  );

  assert.equal(plan.alreadyFullyRunning, true);
  assert.equal(plan.needInfra, false);
  assert.equal(plan.needMigrate, false);
  assert.equal(plan.needSeed, false);
  assert.deepEqual(plan.servicesToStart, []);
});

void test('planStartupActions starts only missing services on partial environment', () => {
  const plan = planStartupActions(
    {
      postgresUp: true,
      authEmulatorUp: true,
      apiPortOpen: true,
      apiDbHealthy: true,
      webUp: false,
    },
    parseCliArgs([]),
  );

  assert.equal(plan.alreadyFullyRunning, false);
  assert.equal(plan.needInfra, false);
  assert.equal(plan.needMigrate, false);
  assert.equal(plan.needSeed, false);
  assert.deepEqual(plan.servicesToStart.map(s => s.id), ['web']);
});

void test('planStartupActions starts infra, migrations, apps, and seed from cold state', () => {
  const plan = planStartupActions(
    {
      postgresUp: false,
      authEmulatorUp: false,
      apiPortOpen: false,
      apiDbHealthy: false,
      webUp: false,
    },
    parseCliArgs([]),
  );

  assert.equal(plan.alreadyFullyRunning, false);
  assert.equal(plan.needInfra, true);
  assert.equal(plan.needMigrate, true);
  assert.equal(plan.needSeed, true);
  assert.deepEqual(plan.servicesToStart.map(s => s.id), ['api', 'web']);
});

void test('buildExternalLaunchSpecs creates a Windows Terminal split-pane command when wt.exe is available', () => {
  const services = [
    { id: 'api', title: 'CasePilot API', pnpmScript: 'dev:api', commandText: 'pnpm dev:api' },
    { id: 'web', title: 'CasePilot Web', pnpmScript: 'dev:web', commandText: 'pnpm dev:web' },
  ];

  const result = buildExternalLaunchSpecs(services, {
    repoRoot: 'C:\\projects\\casepilot',
    platform: 'win32',
    hasCommand: cmd => cmd === 'wt.exe',
  });

  assert.equal(result.mode, 'windows-terminal-split');
  assert.equal(result.launches.length, 1);
  assert.equal(result.launches[0].command, 'wt.exe');
  assert.ok(result.launches[0].args.includes('split-pane'));
  assert.ok(result.launches[0].args.includes('CasePilot API'));
  assert.ok(result.launches[0].args.includes('CasePilot Web'));
  assert.ok(result.launches[0].args.includes('pnpm dev:api'));
  assert.ok(result.launches[0].args.includes('pnpm dev:web'));
});

void test('buildExternalLaunchSpecs falls back to separate PowerShell windows when wt.exe is unavailable', () => {
  const services = [
    { id: 'api', title: 'CasePilot API', pnpmScript: 'dev:api', commandText: 'pnpm dev:api' },
    { id: 'web', title: 'CasePilot Web', pnpmScript: 'dev:web', commandText: 'pnpm dev:web' },
  ];

  const result = buildExternalLaunchSpecs(services, {
    repoRoot: 'C:\\projects\\casepilot',
    platform: 'win32',
    hasCommand: () => false,
  });

  assert.equal(result.mode, 'windows-powershell-windows');
  assert.equal(result.launches.length, 2);
  assert.equal(result.launches[0].command, 'cmd.exe');
  assert.equal(result.launches[1].command, 'cmd.exe');
});

void test('isPortOpen, isHttpOk, and probeEnvironment detect live local servers accurately', async context => {
  const tcpServer = createNetServer();
  await new Promise(resolvePromise => tcpServer.listen(0, '127.0.0.1', resolvePromise));
  context.after(() => tcpServer.close());
  const tcpPort = tcpServer.address().port;

  const httpServer = createHttpServer((req, res) => {
    if (req.url === '/' || req.url === '/health/database') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise(resolvePromise => httpServer.listen(0, '127.0.0.1', resolvePromise));
  context.after(() => httpServer.close());
  const httpPort = httpServer.address().port;

  assert.equal(await isPortOpen(tcpPort), true);
  assert.equal(await isHttpOk(`http://127.0.0.1:${httpPort}/health/database`), true);
  assert.equal(await isHttpOk(`http://127.0.0.1:${httpPort}/missing`), false);

  const state = await probeEnvironment({
    host: '127.0.0.1',
    postgresPort: tcpPort,
    authEmulatorOrigin: `http://127.0.0.1:${httpPort}`,
    apiPort: httpPort,
    apiOrigin: `http://127.0.0.1:${httpPort}`,
    webPort: tcpPort,
  });

  assert.deepEqual(state, {
    postgresUp: true,
    authEmulatorUp: true,
    apiPortOpen: true,
    apiDbHealthy: true,
    webUp: true,
  });
});
