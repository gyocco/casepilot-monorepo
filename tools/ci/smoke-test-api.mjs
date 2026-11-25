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
        headers: { Accept: 'application/json' },
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

export async function runApiSmokeTests({
  apiBaseUrl,
  retries = 6,
  retryDelayMs = 5000,
  timeoutMs = 20000,
}) {
  if (typeof apiBaseUrl !== 'string' || apiBaseUrl.trim().length === 0) {
    throw new Error('API_BASE_URL (or DEV_API_URL) must be provided.');
  }
  const baseUrl = apiBaseUrl.trim().replace(/\/+$/, '');

  // 1. Liveness probe: GET /health -> 200 { status: "ok" }
  await fetchWithRetry(`${baseUrl}/health`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 200) {
        throw new Error(`GET /health expected 200, got ${response.status}`);
      }
      const cacheControl = response.headers.get('cache-control') ?? '';
      if (!cacheControl.toLowerCase().includes('no-store')) {
        throw new Error(`GET /health expected Cache-Control: no-store, got "${cacheControl}"`);
      }
      const body = await response.json();
      if (body?.status !== 'ok') {
        throw new Error(`GET /health unexpected payload: ${JSON.stringify(body)}`);
      }
    },
  });

  // 2. Deep DB readiness probe: GET /health/database -> 200 { status: "ok", objects: [...] }
  await fetchWithRetry(`${baseUrl}/health/database`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 200) {
        throw new Error(`GET /health/database expected 200, got ${response.status}`);
      }
      const body = await response.json();
      if (body?.status !== 'ok' || !Array.isArray(body?.objects)) {
        throw new Error(`GET /health/database unexpected payload: ${JSON.stringify(body)}`);
      }
    },
  });

  // 3. Global Auth guard check: GET /auth/me without Bearer token -> 401 RFC 9457 Problem Details
  await fetchWithRetry(`${baseUrl}/auth/me`, {
    retries,
    retryDelayMs,
    timeoutMs,
    async validate(response) {
      if (response.status !== 401) {
        throw new Error(`GET /auth/me (unauthenticated) expected 401, got ${response.status}`);
      }
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.toLowerCase().includes('application/problem+json')) {
        throw new Error(`GET /auth/me expected application/problem+json, got "${contentType}"`);
      }
      const body = await response.json();
      if (body?.code !== 'UNAUTHORIZED_ERROR') {
        throw new Error(`GET /auth/me expected code UNAUTHORIZED_ERROR, got "${body?.code}"`);
      }
    },
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const apiBaseUrl = process.env.API_BASE_URL || process.env.DEV_API_URL || '';
  const retries = Number(process.env.SMOKE_RETRIES ?? '6');
  const retryDelayMs = Number(process.env.SMOKE_RETRY_DELAY_MS ?? '5000');
  const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? '20000');

  await runApiSmokeTests({ apiBaseUrl, retries, retryDelayMs, timeoutMs });
  process.stdout.write(`API smoke tests passed against ${apiBaseUrl}\n`);
}
