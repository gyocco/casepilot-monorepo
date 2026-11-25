import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function sleep(ms) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, ms));
}

async function fetchWithRetry(url, { retries, retryDelayMs, timeoutMs, validate }) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
      });
      await validate(response);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelayMs);
      }
    }
  }
  throw lastError;
}

export async function runWebSmokeTests({
  webBaseUrl,
  expectedEnvironment = 'development',
  expectedApiBaseUrl,
  retries = 5,
  retryDelayMs = 3000,
  timeoutMs = 15000,
}) {
  if (typeof webBaseUrl !== 'string' || webBaseUrl.trim().length === 0) {
    throw new Error('WEB_BASE_URL must be provided.');
  }
  const baseUrl = webBaseUrl.trim().replace(/\/+$/, '');
  const normalizedExpectedApi = expectedApiBaseUrl?.trim().replace(/\/+$/, '');

  // 1. Root HTML + security headers
  await fetchWithRetry(`${baseUrl}/`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 200) {
        throw new Error(`GET / expected 200, got ${response.status}`);
      }
      const noSniff = response.headers.get('x-content-type-options') ?? '';
      if (noSniff.toLowerCase() !== 'nosniff') {
        throw new Error(`GET / expected X-Content-Type-Options: nosniff, got "${noSniff}"`);
      }
      const html = await response.text();
      if (!html.includes('<cp-root')) {
        throw new Error('GET / did not return the expected Angular <cp-root> shell.');
      }
    },
  });

  // 2. Public runtime config with Cache-Control: no-store and no emulator
  await fetchWithRetry(`${baseUrl}/app-config.json`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 200) {
        throw new Error(`GET /app-config.json expected 200, got ${response.status}`);
      }
      const cacheControl = response.headers.get('cache-control') ?? '';
      if (!cacheControl.toLowerCase().includes('no-store')) {
        throw new Error(`GET /app-config.json expected Cache-Control: no-store, got "${cacheControl}"`);
      }
      const body = await response.json();
      if (body?.environment !== expectedEnvironment) {
        throw new Error(`GET /app-config.json expected environment="${expectedEnvironment}", got "${body?.environment}"`);
      }
      if (body?.authEmulatorUrl !== null) {
        throw new Error(`GET /app-config.json expected authEmulatorUrl=null, got ${JSON.stringify(body?.authEmulatorUrl)}`);
      }
      if (normalizedExpectedApi && body?.apiBaseUrl !== normalizedExpectedApi) {
        throw new Error(`GET /app-config.json expected apiBaseUrl="${normalizedExpectedApi}", got "${body?.apiBaseUrl}"`);
      }
      if (!body?.firebase?.projectId || !body?.firebase?.apiKey) {
        throw new Error('GET /app-config.json is missing required public firebase fields.');
      }
    },
  });

  // 3. SPA client-route rewrite check
  await fetchWithRetry(`${baseUrl}/auth/login`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 200) {
        throw new Error(`GET /auth/login expected 200 SPA rewrite, got ${response.status}`);
      }
      const html = await response.text();
      if (!html.includes('<cp-root')) {
        throw new Error('GET /auth/login did not serve the Angular SPA index.html.');
      }
    },
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const webBaseUrl = process.env.WEB_BASE_URL || '';
  const expectedEnvironment = process.env.WEB_ENVIRONMENT || 'development';
  const expectedApiBaseUrl = process.env.API_BASE_URL || process.env.DEV_API_URL || '';
  const retries = Number(process.env.SMOKE_RETRIES ?? '5');
  const retryDelayMs = Number(process.env.SMOKE_RETRY_DELAY_MS ?? '3000');
  const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? '15000');

  await runWebSmokeTests({
    webBaseUrl,
    expectedEnvironment,
    expectedApiBaseUrl,
    retries,
    retryDelayMs,
    timeoutMs,
  });
  process.stdout.write(`Web smoke tests passed against ${webBaseUrl}\n`);
}
