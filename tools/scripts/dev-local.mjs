import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import net from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '../..');

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_POSTGRES_PORT = 55432;
const DEFAULT_AUTH_EMULATOR_PORT = 9099;
const DEFAULT_AUTH_EMULATOR_UI_PORT = 4000;
const DEFAULT_API_PORT = 3000;
const DEFAULT_WEB_PORT = 4200;

export function parseCliArgs(argv) {
  const options = {
    inline: false,
    skipSeed: false,
    skipMigrate: false,
    forceInfra: false,
    noWait: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--inline') {
      options.inline = true;
    } else if (arg === '--skip-seed') {
      options.skipSeed = true;
    } else if (arg === '--skip-migrate') {
      options.skipMigrate = true;
    } else if (arg === '--force-infra') {
      options.forceInfra = true;
    } else if (arg === '--no-wait') {
      options.noWait = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}. Use --help to see supported flags.`);
    }
  }

  return options;
}

export function formatHelp() {
  return [
    'Usage: pnpm dev:local [options]',
    '',
    'Idempotently starts the full CasePilot local environment:',
    '  1. Docker dependencies (PostgreSQL + Firebase Auth Emulator)',
    '  2. API database migrations (pnpm migration:api:run)',
    '  3. CasePilot API (:3000) and CasePilot Web (:4200) in split external terminals',
    '  4. Idempotent local test users seed (pnpm seed:local)',
    '',
    'Options:',
    '  --inline        Run missing app processes in the current terminal instead of external windows',
    '  --skip-seed     Skip running pnpm seed:local after the API is healthy',
    '  --skip-migrate  Skip running pnpm migration:api:run',
    '  --force-infra   Always run pnpm infra:up even if Postgres and Auth Emulator already respond',
    '  --no-wait       Do not wait for API/Web readiness after spawning external terminals',
    '  -h, --help      Show this help message',
  ].join('\n');
}

export function parseEnvContent(raw) {
  const parsed = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    parsed[key] = value;
  }
  return parsed;
}

export async function readDockerEnv(repoRoot = DEFAULT_REPO_ROOT) {
  const envPath = resolve(repoRoot, 'infra/docker/.env');
  try {
    const raw = await readFile(envPath, 'utf8');
    return parseEnvContent(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function parsePort(raw, fallback) {
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }
  const value = Number.parseInt(String(raw), 10);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    return fallback;
  }
  return value;
}

export function resolveEndpoints(dockerEnv = {}, processEnv = process.env) {
  const postgresPort = parsePort(
    processEnv.CASEPILOT_POSTGRES_PORT ?? dockerEnv.CASEPILOT_POSTGRES_PORT,
    DEFAULT_POSTGRES_PORT,
  );
  const authEmulatorPort = parsePort(
    processEnv.CASEPILOT_FIREBASE_AUTH_EMULATOR_PORT ?? dockerEnv.CASEPILOT_FIREBASE_AUTH_EMULATOR_PORT,
    DEFAULT_AUTH_EMULATOR_PORT,
  );
  const authEmulatorUiPort = parsePort(
    processEnv.CASEPILOT_FIREBASE_EMULATOR_UI_PORT ?? dockerEnv.CASEPILOT_FIREBASE_EMULATOR_UI_PORT,
    DEFAULT_AUTH_EMULATOR_UI_PORT,
  );
  const apiPort = parsePort(processEnv.PORT ?? processEnv.CASEPILOT_API_PORT, DEFAULT_API_PORT);
  const webPort = parsePort(processEnv.CASEPILOT_WEB_PORT, DEFAULT_WEB_PORT);

  const apiOrigin = `http://${DEFAULT_HOST}:${apiPort}`;
  const webOrigin = `http://${DEFAULT_HOST}:${webPort}`;
  const authEmulatorOrigin = `http://${DEFAULT_HOST}:${authEmulatorPort}`;
  const authEmulatorUiOrigin = `http://${DEFAULT_HOST}:${authEmulatorUiPort}`;

  for (const [label, url] of [
    ['API', apiOrigin],
    ['Web', webOrigin],
    ['Auth Emulator', authEmulatorOrigin],
  ]) {
    const parsed = new URL(url);
    if (!LOCAL_HOSTS.has(parsed.hostname)) {
      throw new Error(`Refusing non-loopback ${label} host: ${parsed.hostname}`);
    }
  }

  return {
    host: DEFAULT_HOST,
    postgresPort,
    authEmulatorPort,
    authEmulatorUiPort,
    authEmulatorOrigin,
    authEmulatorUiOrigin,
    apiPort,
    apiOrigin,
    webPort,
    webOrigin,
  };
}

export function isPortOpen(port, host = DEFAULT_HOST, timeoutMs = 1000) {
  return new Promise(resolvePromise => {
    const socket = net.createConnection({ port, host });
    let settled = false;

    const finish = result => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolvePromise(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

export async function isHttpOk(url, timeoutMs = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeEnvironment(endpoints, probes = {}) {
  const checkPort = probes.isPortOpen ?? isPortOpen;
  const checkHttp = probes.isHttpOk ?? isHttpOk;

  const [postgresUp, authEmulatorUp, apiPortOpen, apiDbHealthy, webUp] = await Promise.all([
    checkPort(endpoints.postgresPort, endpoints.host),
    checkHttp(`${endpoints.authEmulatorOrigin}/`),
    checkPort(endpoints.apiPort, endpoints.host),
    checkHttp(`${endpoints.apiOrigin}/health/database`),
    checkPort(endpoints.webPort, endpoints.host),
  ]);

  return {
    postgresUp,
    authEmulatorUp,
    apiPortOpen,
    apiDbHealthy,
    webUp,
  };
}

export function planStartupActions(state, options) {
  const needInfra = options.forceInfra || !state.postgresUp || !state.authEmulatorUp;
  const servicesToStart = [];

  if (!state.apiPortOpen) {
    servicesToStart.push({
      id: 'api',
      title: 'CasePilot API',
      pnpmScript: 'dev:api',
      commandText: 'pnpm dev:api',
    });
  }

  if (!state.webUp) {
    servicesToStart.push({
      id: 'web',
      title: 'CasePilot Web',
      pnpmScript: 'dev:web',
      commandText: 'pnpm dev:web',
    });
  }

  const needMigrate = !options.skipMigrate && (needInfra || !state.apiPortOpen || !state.apiDbHealthy);
  const needSeed = !options.skipSeed && (needInfra || needMigrate || !state.apiPortOpen);

  return {
    needInfra,
    needMigrate,
    servicesToStart,
    needSeed,
    alreadyFullyRunning: !needInfra && !needMigrate && servicesToStart.length === 0,
  };
}

export function commandExists(command, platform = process.platform) {
  const checker = platform === 'win32' ? 'where.exe' : 'which';
  const result = spawnSync(checker, [command], { stdio: 'ignore' });
  return result.status === 0;
}

export function buildExternalLaunchSpecs(services, {
  repoRoot = DEFAULT_REPO_ROOT,
  platform = process.platform,
  hasCommand = cmd => commandExists(cmd, platform),
} = {}) {
  if (services.length === 0) {
    return { mode: 'none', launches: [] };
  }

  if (platform === 'win32') {
    if (hasCommand('wt.exe')) {
      const wtArgs = [];
      services.forEach((service, index) => {
        if (index === 0) {
          wtArgs.push(
            '-w', 'new',
            'new-tab',
            '--title', service.title,
            '-d', repoRoot,
            'powershell.exe', '-NoExit', '-Command', service.commandText,
          );
        } else {
          wtArgs.push(
            ';',
            'split-pane', '-V',
            '--title', service.title,
            '-d', repoRoot,
            'powershell.exe', '-NoExit', '-Command', service.commandText,
          );
        }
      });

      return {
        mode: 'windows-terminal-split',
        launches: [{ command: 'wt.exe', args: wtArgs, cwd: repoRoot }],
      };
    }

    return {
      mode: 'windows-powershell-windows',
      launches: services.map(service => ({
        command: 'cmd.exe',
        args: [
          '/c', 'start', service.title,
          '/D', repoRoot,
          'powershell.exe', '-NoExit', '-Command', service.commandText,
        ],
        cwd: repoRoot,
      })),
    };
  }

  if (platform === 'darwin') {
    return {
      mode: 'macos-terminal',
      launches: services.map(service => {
        const escapedRoot = repoRoot.replaceAll('"', '\\"');
        const script = `tell application "Terminal" to do script "cd \\"${escapedRoot}\\" && ${service.commandText}"`;
        return {
          command: 'osascript',
          args: ['-e', script],
          cwd: repoRoot,
        };
      }),
    };
  }

  for (const terminal of ['gnome-terminal', 'konsole', 'xfce4-terminal', 'x-terminal-emulator']) {
    if (hasCommand(terminal)) {
      const launches = services.map(service => {
        const shellCmd = `${service.commandText}; exec $SHELL`;
        if (terminal === 'gnome-terminal') {
          return {
            command: terminal,
            args: ['--working-directory', repoRoot, '--title', service.title, '--', 'bash', '-lc', shellCmd],
            cwd: repoRoot,
          };
        }
        if (terminal === 'konsole') {
          return {
            command: terminal,
            args: ['--workdir', repoRoot, '-e', 'bash', '-lc', shellCmd],
            cwd: repoRoot,
          };
        }
        return {
          command: terminal,
          args: ['-e', `bash -lc "${shellCmd}"`],
          cwd: repoRoot,
        };
      });
      return { mode: `linux-${terminal}`, launches };
    }
  }

  return { mode: 'inline-fallback', launches: [] };
}

function runPnpmStep(pnpmArgs, repoRoot, label) {
  console.log(`\n[dev:local] ${label} (pnpm ${pnpmArgs.join(' ')})...`);
  const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(pnpmBin, pnpmArgs, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command "pnpm ${pnpmArgs.join(' ')}" exited with status ${result.status ?? 'unknown'}.`);
  }
}

export async function waitUntil(checkFn, {
  timeoutMs = 90_000,
  intervalMs = 1000,
  label = 'service',
} = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await checkFn()) {
      return true;
    }
    await new Promise(resolvePromise => setTimeout(resolvePromise, intervalMs));
  }
  throw new Error(`Timed out waiting for ${label} after ${Math.round(timeoutMs / 1000)}s.`);
}

function spawnExternalLaunches(launchPlan) {
  for (const launch of launchPlan.launches) {
    const child = spawn(launch.command, launch.args, {
      cwd: launch.cwd,
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  }
}

function runInlineServices(services, repoRoot) {
  const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const children = [];

  for (const service of services) {
    const prefix = `[${service.id.toUpperCase()}]`;
    const child = spawn(pnpmBin, [service.pnpmScript], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    const pipeLines = (stream, writer) => {
      let buffer = '';
      stream.setEncoding('utf8');
      stream.on('data', chunk => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          writer(`${prefix} ${line}\n`);
        }
      });
      stream.on('end', () => {
        if (buffer.length > 0) {
          writer(`${prefix} ${buffer}\n`);
        }
      });
    };

    pipeLines(child.stdout, text => process.stdout.write(text));
    pipeLines(child.stderr, text => process.stderr.write(text));
    children.push(child);
  }

  const shutdown = () => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGINT');
      }
    }
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  return children;
}

function printSummary(endpoints, state, plan) {
  const pgStatus = plan.needInfra ? 'started' : 'already running';
  const authStatus = plan.needInfra ? 'started' : 'already running';
  const apiStatus = state.apiPortOpen ? 'already running' : 'started';
  const webStatus = state.webUp ? 'already running' : 'started';

  console.log('\nCasePilot local environment ready:');
  console.log(`  - PostgreSQL:            ${endpoints.host}:${endpoints.postgresPort} (${pgStatus})`);
  console.log(`  - Firebase Auth:         ${endpoints.authEmulatorOrigin} (${authStatus})`);
  console.log(`  - Firebase Emulator UI:  ${endpoints.authEmulatorUiOrigin}`);
  console.log(`  - CasePilot API:         ${endpoints.apiOrigin} (${apiStatus}) -> /health, /health/database`);
  console.log(`  - CasePilot Web:         ${endpoints.webOrigin} (${webStatus})`);
}

export async function main(argv = process.argv.slice(2), repoRoot = DEFAULT_REPO_ROOT) {
  const options = parseCliArgs(argv);
  if (options.help) {
    console.log(formatHelp());
    return;
  }

  const dockerEnv = await readDockerEnv(repoRoot);
  const endpoints = resolveEndpoints(dockerEnv);
  const initialState = await probeEnvironment(endpoints);
  const plan = planStartupActions(initialState, options);

  if (plan.alreadyFullyRunning) {
    console.log('[dev:local] All local services are already running. Nothing to start.');
    printSummary(endpoints, initialState, plan);
    return;
  }

  if (plan.needInfra) {
    runPnpmStep(['infra:up'], repoRoot, 'Starting Docker dependencies (PostgreSQL + Firebase Auth Emulator)');
  } else {
    console.log('[dev:local] Docker dependencies already running (PostgreSQL + Firebase Auth Emulator).');
  }

  if (plan.needMigrate) {
    runPnpmStep(['migration:api:run'], repoRoot, 'Applying API database migrations');
  }

  if (plan.servicesToStart.length > 0) {
    const launchPlan = options.inline
      ? { mode: 'inline', launches: [] }
      : buildExternalLaunchSpecs(plan.servicesToStart, { repoRoot });

    if (launchPlan.mode === 'inline' || launchPlan.mode === 'inline-fallback') {
      if (launchPlan.mode === 'inline-fallback') {
        console.log('[dev:local] No supported external terminal found; running apps inline.');
      } else {
        console.log('[dev:local] Running apps inline (Ctrl+C to stop).');
      }

      runInlineServices(plan.servicesToStart, repoRoot);

      if (plan.needSeed) {
        console.log('[dev:local] Waiting for API health before running local seed...');
        await waitUntil(() => isHttpOk(`${endpoints.apiOrigin}/health/database`), {
          label: `${endpoints.apiOrigin}/health/database`,
        });
        runPnpmStep(['seed:local'], repoRoot, 'Seeding local test users (idempotent)');
      }

      printSummary(endpoints, initialState, plan);
      return;
    }

    const titles = plan.servicesToStart.map(s => s.title).join(' + ');
    console.log(`[dev:local] Opening external terminal (${launchPlan.mode}) for: ${titles}`);
    spawnExternalLaunches(launchPlan);
  }

  if (!options.noWait) {
    if (!initialState.apiPortOpen || !initialState.apiDbHealthy) {
      console.log(`[dev:local] Waiting for CasePilot API at ${endpoints.apiOrigin}/health/database...`);
      await waitUntil(() => isHttpOk(`${endpoints.apiOrigin}/health/database`), {
        timeoutMs: 90_000,
        label: `CasePilot API (${endpoints.apiOrigin}/health/database)`,
      });
    }

    if (plan.needSeed) {
      runPnpmStep(['seed:local'], repoRoot, 'Seeding local test users (idempotent)');
    }

    if (!initialState.webUp) {
      console.log(`[dev:local] Waiting for CasePilot Web at ${endpoints.webOrigin}...`);
      await waitUntil(() => isPortOpen(endpoints.webPort, endpoints.host), {
        timeoutMs: 120_000,
        label: `CasePilot Web (${endpoints.webOrigin})`,
      });
    }
  } else if (plan.needSeed) {
    console.log('[dev:local] Skipped waiting (--no-wait). Run "pnpm seed:local" once the API is up.');
  }

  printSummary(endpoints, initialState, plan);
}

const isEntrypoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntrypoint) {
  main().catch(error => {
    console.error(`\n[dev:local] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
