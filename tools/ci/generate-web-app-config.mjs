import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_ENVIRONMENTS = new Set(['development', 'staging', 'production']);
const FORBIDDEN_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

function requireValue(env, key) {
  const value = env[key];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required non-empty environment variable: ${key}`);
  }
  return value.trim();
}

function validateHttpsUrl(raw, label) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${label} must use HTTPS for non-local deployments.`);
  }
  if (FORBIDDEN_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    throw new Error(`${label} cannot point to a loopback host in non-local deployments.`);
  }
  return raw.replace(/\/+$/, '');
}

export function buildWebAppConfig(env) {
  const environment = (env.WEB_ENVIRONMENT ?? 'development').trim();
  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    throw new Error(`WEB_ENVIRONMENT must be one of development, staging, or production (got "${environment}").`);
  }

  const apiBaseUrl = validateHttpsUrl(
    env.API_BASE_URL?.trim() || requireValue(env, 'DEV_API_URL'),
    'API_BASE_URL / DEV_API_URL',
  );
  const apiKey = requireValue(env, 'FIREBASE_WEB_API_KEY');
  const authDomain = requireValue(env, 'FIREBASE_WEB_AUTH_DOMAIN');
  const projectId = requireValue(env, 'FIREBASE_WEB_PROJECT_ID');
  const appId = requireValue(env, 'FIREBASE_WEB_APP_ID');

  if (projectId.startsWith('demo-') || apiKey.startsWith('demo-')) {
    throw new Error('Demo/local Firebase placeholder values are forbidden in non-local app-config.json.');
  }

  return {
    environment,
    apiBaseUrl,
    firebase: {
      apiKey,
      authDomain,
      projectId,
      appId,
    },
    authEmulatorUrl: null,
  };
}

export function writeWebAppConfig(env = process.env) {
  const config = buildWebAppConfig(env);
  const outputPath = resolve(
    env.OUTPUT_PATH?.trim() || 'src/apps/casepilot/casepilot-web/dist/browser/app-config.json',
  );
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return { outputPath, config };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { outputPath, config } = writeWebAppConfig(process.env);
  process.stdout.write(
    `Generated public web config (${config.environment}) for project "${config.firebase.projectId}" at ${outputPath}\n`,
  );
}
