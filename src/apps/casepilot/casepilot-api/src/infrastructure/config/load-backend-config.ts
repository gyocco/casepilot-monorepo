import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import type { ApplicationEnvironment, BackendConfig } from './backend-config.js';

type EnvironmentVariables = Readonly<Record<string, string | undefined>>;

export class BackendConfigurationError extends Error {}

function readEnvironmentFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  try {
    const entries: [string, unknown][] = Object.entries(parseEnv(readFileSync(path, 'utf8')));
    const variables: Record<string, string> = {};
    for (const [key, value] of entries) {
      if (typeof value === 'string') variables[key] = value;
    }
    return variables;
  } catch {
    throw new BackendConfigurationError('Unable to read an environment configuration file.');
  }
}

function required(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new BackendConfigurationError(`${name} must be configured.`);
  }
  return value;
}

function integer(value: string, name: string, min: number, max: number): number {
  if (!/^\d+$/.test(value)) throw new BackendConfigurationError(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new BackendConfigurationError(`${name} is outside its supported range.`);
  }
  return parsed;
}

function environmentName(value: string): ApplicationEnvironment {
  switch (value) {
    case 'local': case 'test': case 'development': case 'staging': case 'production':
      return value;
    default:
      throw new BackendConfigurationError('APP_ENV is not a supported environment.');
  }
}

export function findApplicationRoot(startDirectory: string = dirname(fileURLToPath(import.meta.url))): string {
  let current = resolve(startDirectory);
  while (true) {
    const hasManifest = existsSync(resolve(current, 'package.json'));
    const hasAppMarker = existsSync(resolve(current, 'tsconfig.json')) || existsSync(resolve(current, 'dist', 'main.js'));
    if (hasManifest && hasAppMarker) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) throw new BackendConfigurationError('Unable to locate casepilot-api configuration.');
    current = parent;
  }
}

export function loadBackendConfig(
  processVariables: EnvironmentVariables = process.env,
  applicationRoot: string = findApplicationRoot(),
): BackendConfig {
  const common = readEnvironmentFile(resolve(applicationRoot, '.env'));
  const selected = processVariables.APP_ENV ?? common.APP_ENV;
  if (!selected && processVariables.NODE_ENV === 'production') {
    throw new BackendConfigurationError('APP_ENV must be explicitly configured in production.');
  }
  const environment = environmentName(selected ?? 'local');
  const specific = readEnvironmentFile(resolve(applicationRoot, `.env.${environment}`));
  if (specific.APP_ENV && specific.APP_ENV !== environment) {
    throw new BackendConfigurationError('The environment file cannot change the selected APP_ENV.');
  }
  const localDocker = environment === 'local'
    ? readEnvironmentFile(resolve(applicationRoot, '../../../../infra/docker/.env')) : {};
  const variables = { ...localDocker, ...common, ...specific, ...processVariables };
  const local = environment === 'local';
  const exposeErrorDetails = variables.API_ERROR_DETAILS ??
    (local || environment === 'development' || environment === 'test' ? 'true' : 'false');
  if (exposeErrorDetails !== 'true' && exposeErrorDetails !== 'false') {
    throw new BackendConfigurationError('API_ERROR_DETAILS must be true or false.');
  }

  let host = variables.DATABASE_HOST ?? (local ? '127.0.0.1' : undefined);
  let port = variables.DATABASE_PORT ?? (local ? variables.CASEPILOT_POSTGRES_PORT ?? '55432' : '5432');
  let database = variables.DATABASE_NAME ?? (local ? variables.CASEPILOT_POSTGRES_DB ?? 'casepilot' : undefined);
  let username = variables.DATABASE_USER ?? (local ? variables.CASEPILOT_POSTGRES_USER ?? 'casepilot' : undefined);
  let password = variables.DATABASE_PASSWORD ?? (local ? variables.CASEPILOT_POSTGRES_PASSWORD : undefined);
  if (variables.DATABASE_URL) {
    try {
      const url = new URL(variables.DATABASE_URL);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.search || url.hash) throw new Error();
      host = url.hostname;
      port = url.port || '5432';
      database = decodeURIComponent(url.pathname.slice(1));
      username = decodeURIComponent(url.username);
      password = decodeURIComponent(url.password);
    } catch {
      throw new BackendConfigurationError('DATABASE_URL must be a PostgreSQL URL without query parameters.');
    }
  }

  const schema = variables.DATABASE_SCHEMA ?? 'public';
  if (!/^[a-z_][a-z0-9_]{0,62}$/.test(schema)) {
    throw new BackendConfigurationError('DATABASE_SCHEMA must be a PostgreSQL schema identifier.');
  }
  const tls = variables.DATABASE_SSL ?? (local || environment === 'test' ? 'false' : 'true');
  if (tls !== 'true' && tls !== 'false') throw new BackendConfigurationError('DATABASE_SSL must be true or false.');
  let ca: string | undefined;
  if (variables.DATABASE_SSL_CA_FILE) {
    const caPath = variables.DATABASE_SSL_CA_FILE;
    if (tls !== 'true' || !isAbsolute(caPath)) {
      throw new BackendConfigurationError('DATABASE_SSL_CA_FILE requires TLS and an absolute path.');
    }
    try { ca = readFileSync(caPath, 'utf8'); } catch {
      throw new BackendConfigurationError('Unable to read DATABASE_SSL_CA_FILE.');
    }
  }
  const statementTimeoutEnabled = variables.DATABASE_STATEMENT_TIMEOUT_ENABLED ?? 'true';
  if (statementTimeoutEnabled !== 'true' && statementTimeoutEnabled !== 'false') {
    throw new BackendConfigurationError('DATABASE_STATEMENT_TIMEOUT_ENABLED must be true or false.');
  }
  const databasePassword = required(password, 'DATABASE_PASSWORD');
  if (['replace-with-local-password', 'REPLACE_WITH_PASSWORD', 'REPLACE_WITH_LOCAL_PASSWORD'].includes(databasePassword)) {
    throw new BackendConfigurationError('DATABASE_PASSWORD must not be an example placeholder.');
  }

  const corsOrigins = (variables.CORS_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  for (const origin of corsOrigins) {
    try {
      const url = new URL(origin);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) throw new Error();
    } catch {
      throw new BackendConfigurationError('CORS_ORIGINS must contain explicit HTTP/HTTPS origins.');
    }
  }

  const firebaseProjectId = required(
    variables.AUTH_FIREBASE_PROJECT_ID ?? (local || environment === 'test' ? 'demo-casepilot-local' : undefined),
    'AUTH_FIREBASE_PROJECT_ID',
  ).trim();
  if (!/^[a-z0-9][a-z0-9-]{3,62}$/.test(firebaseProjectId)) {
    throw new BackendConfigurationError('AUTH_FIREBASE_PROJECT_ID must be a valid Firebase project identifier.');
  }

  const rawEmulatorHost = variables.FIREBASE_AUTH_EMULATOR_HOST?.trim()
    || (local ? variables.CASEPILOT_FIREBASE_AUTH_EMULATOR_HOST?.trim() || '127.0.0.1:9099' : '');
  if (rawEmulatorHost && !local) {
    throw new BackendConfigurationError('FIREBASE_AUTH_EMULATOR_HOST is permitted only in the local environment.');
  }
  if (rawEmulatorHost && !/^[a-zA-Z0-9.-]+:\d{1,5}$/.test(rawEmulatorHost)) {
    throw new BackendConfigurationError('FIREBASE_AUTH_EMULATOR_HOST must be in host:port format.');
  }
  return {
    environment,
    http: {
      host: required(variables.API_HOST ?? (local || environment === 'test' ? '127.0.0.1' : '0.0.0.0'), 'API_HOST'),
      port: integer(variables.API_PORT ?? variables.PORT ?? '3000', 'API_PORT', 1, 65535),
      corsOrigins,
      exposeErrorDetails: exposeErrorDetails === 'true',
    },
    database: {
      host: required(host, 'DATABASE_HOST'),
      port: integer(port, 'DATABASE_PORT', 1, 65535),
      database: required(database, 'DATABASE_NAME'),
      username: required(username, 'DATABASE_USER'),
      password: databasePassword,
      schema,
      ssl: tls === 'false' ? false : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
      connectTimeoutMs: integer(variables.DATABASE_CONNECT_TIMEOUT_MS ?? '3000', 'DATABASE_CONNECT_TIMEOUT_MS', 1, 60000),
      queryTimeoutMs: integer(variables.DATABASE_QUERY_TIMEOUT_MS ?? '3000', 'DATABASE_QUERY_TIMEOUT_MS', 1, 60000),
      statementTimeoutEnabled: statementTimeoutEnabled === 'true',
      poolSize: integer(variables.DATABASE_POOL_SIZE ?? '5', 'DATABASE_POOL_SIZE', 1, 100),
    },
    auth: {
      firebaseProjectId,
      emulatorHost: rawEmulatorHost || null,
    },
  };
}
