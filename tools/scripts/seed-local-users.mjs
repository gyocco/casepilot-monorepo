import { readFile } from 'node:fs/promises';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
const EMULATOR_API_KEY = 'demo-casepilot-local-api-key';
const SHARED_ACCOUNT_SLUG = 'casepilot-local-team';
const SHARED_ACCOUNT_NAME = 'CasePilot Local Team';
const DEFAULT_LOCAL_PASSWORD = 'LocalDev123!';

const SEED_USERS = [
  { email: 'owner@local.test', displayName: 'Local Owner', teamRole: 'OWNER', title: 'Managing Partner' },
  { email: 'admin@local.test', displayName: 'Local Admin', teamRole: 'ADMIN', title: 'Operations Admin' },
  { email: 'member@local.test', displayName: 'Local Member', teamRole: 'MEMBER', title: 'Senior Associate' },
  { email: 'viewer@local.test', displayName: 'Local Viewer', teamRole: 'VIEWER', title: 'External Auditor' },
];

async function readDockerEnv() {
  const envUrl = new URL('../../infra/docker/.env', import.meta.url);
  try {
    const raw = await readFile(envUrl, 'utf8');
    const parsed = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      parsed[key] = value;
    }
    return parsed;
  } catch (error) {
    if (error && error.code === 'ENOENT') return {};
    throw error;
  }
}

function assertLoopbackUrl(rawUrl, label) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`${label} is not a valid URL: ${rawUrl}`);
  }
  if (!LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `Refusing to run local seed against non-local ${label} (${parsed.hostname}). `
      + 'seed:local is restricted to loopback hosts only.',
    );
  }
  return parsed.origin;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  return { ok: response.ok, status: response.status, body };
}

async function assertServicesReachable(emulatorOrigin, apiOrigin) {
  try {
    const emulatorCheck = await fetch(`${emulatorOrigin}/`);
    if (!emulatorCheck.ok) {
      throw new Error(`HTTP ${emulatorCheck.status}`);
    }
  } catch (error) {
    throw new Error(
      `Firebase Auth Emulator is not reachable at ${emulatorOrigin}. `
      + `Run "pnpm infra:up" first. (${error instanceof Error ? error.message : String(error)})`,
    );
  }

  try {
    const apiCheck = await fetchJson(`${apiOrigin}/health/database`);
    if (!apiCheck.ok) {
      throw new Error(`HTTP ${apiCheck.status} — ensure migrations are applied (pnpm migration:api:run)`);
    }
  } catch (error) {
    throw new Error(
      `CasePilot API is not reachable at ${apiOrigin}/health/database. `
      + `Run "pnpm migration:api:run" and "pnpm dev:api" first. (${error instanceof Error ? error.message : String(error)})`,
    );
  }
}

async function ensureEmulatorUser(emulatorOrigin, user, password) {
  const signUpUrl = `${emulatorOrigin}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${EMULATOR_API_KEY}`;
  const signInUrl = `${emulatorOrigin}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${EMULATOR_API_KEY}`;
  const updateUrl = `${emulatorOrigin}/identitytoolkit.googleapis.com/v1/accounts:update?key=${EMULATOR_API_KEY}`;

  let localId = null;
  let emulatorCreated = false;

  const signUp = await fetchJson(signUpUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password,
      displayName: user.displayName,
      returnSecureToken: true,
    }),
  });

  if (signUp.ok && signUp.body?.localId) {
    localId = signUp.body.localId;
    emulatorCreated = true;
  } else if (signUp.body?.error?.message === 'EMAIL_EXISTS') {
    const signIn = await fetchJson(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password,
        returnSecureToken: true,
      }),
    });
    if (!signIn.ok || !signIn.body?.localId) {
      throw new Error(
        `User ${user.email} already exists in the emulator, but sign-in failed `
        + `(status ${signIn.status}). If you changed the password, run "pnpm infra:reset" or set CASEPILOT_LOCAL_SEED_PASSWORD.`,
      );
    }
    localId = signIn.body.localId;
  } else {
    throw new Error(
      `Failed to create emulator user ${user.email} (status ${signUp.status}): ${JSON.stringify(signUp.body)}`,
    );
  }

  // Mark emailVerified=true and sync displayName using the Auth Emulator admin bypass token.
  const verify = await fetchJson(updateUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer owner',
    },
    body: JSON.stringify({
      localId,
      displayName: user.displayName,
      emailVerified: true,
    }),
  });
  if (!verify.ok) {
    throw new Error(
      `Failed to mark ${user.email} as verified in emulator (status ${verify.status}): ${JSON.stringify(verify.body)}`,
    );
  }

  // Re-sign in to obtain a fresh ID token carrying email_verified: true and displayName.
  const freshSignIn = await fetchJson(signInUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password,
      returnSecureToken: true,
    }),
  });
  if (!freshSignIn.ok || !freshSignIn.body?.idToken) {
    throw new Error(`Failed to obtain ID token for ${user.email} (status ${freshSignIn.status}).`);
  }

  return {
    localId,
    idToken: freshSignIn.body.idToken,
    emulatorCreated,
  };
}

async function bootstrapUser(apiOrigin, idToken) {
  const result = await fetchJson(`${apiOrigin}/auth/me/bootstrap`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!result.ok || !result.body?.profile?.id) {
    throw new Error(`Bootstrap failed (status ${result.status}): ${JSON.stringify(result.body)}`);
  }
  return {
    userId: result.body.profile.id,
    provisioned: Boolean(result.body.provisioned),
  };
}

async function ensureSharedTeamAccount(apiOrigin, ownerToken, ownerEmail) {
  const list = await fetchJson(`${apiOrigin}/business-accounts?pageNumber=1&pageSize=100`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  if (!list.ok || !Array.isArray(list.body?.items)) {
    throw new Error(`Failed to list business accounts (status ${list.status}): ${JSON.stringify(list.body)}`);
  }

  const existing = list.body.items.find(item => item.slug === SHARED_ACCOUNT_SLUG);
  if (existing) {
    return { accountId: existing.id, created: false };
  }

  const created = await fetchJson(`${apiOrigin}/business-accounts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: SHARED_ACCOUNT_NAME,
      legalName: null,
      slug: SHARED_ACCOUNT_SLUG,
      type: 'FIRM',
      taxId: null,
      email: ownerEmail,
      phone: null,
      website: null,
      timezone: 'UTC',
      locale: 'es',
      currency: 'USD',
      countryCode: 'US',
      status: 'ACTIVE',
      settings: null,
    }),
  });
  if (!created.ok || !created.body?.item?.id) {
    throw new Error(`Failed to create shared business account (status ${created.status}): ${JSON.stringify(created.body)}`);
  }
  return { accountId: created.body.item.id, created: true };
}

async function ensureTeamMemberships(apiOrigin, ownerToken, accountId, seededUsers) {
  const list = await fetchJson(
    `${apiOrigin}/business-accounts/${accountId}/members?pageNumber=1&pageSize=100`,
    { headers: { Authorization: `Bearer ${ownerToken}` } },
  );
  if (!list.ok || !Array.isArray(list.body?.items)) {
    throw new Error(`Failed to list team members (status ${list.status}): ${JSON.stringify(list.body)}`);
  }

  const existingUserIds = new Set(list.body.items.map(member => member.userId));
  const nowIso = new Date().toISOString();
  const addedRoles = [];

  for (const entry of seededUsers) {
    if (entry.teamRole === 'OWNER' || existingUserIds.has(entry.userId)) {
      continue;
    }
    const created = await fetchJson(`${apiOrigin}/business-accounts/${accountId}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: entry.userId,
        role: entry.teamRole,
        status: 'ACTIVE',
        title: entry.title,
        professionalRegistration: null,
        hourlyRate: null,
        joinedAt: nowIso,
        invitedAt: null,
      }),
    });
    if (!created.ok) {
      throw new Error(
        `Failed to add ${entry.email} (${entry.teamRole}) to ${SHARED_ACCOUNT_NAME} `
        + `(status ${created.status}): ${JSON.stringify(created.body)}`,
      );
    }
    addedRoles.push(`${entry.email} (${entry.teamRole})`);
  }

  return addedRoles;
}

async function main() {
  const dockerEnv = await readDockerEnv();
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST
    || dockerEnv.CASEPILOT_FIREBASE_AUTH_EMULATOR_HOST
    || `127.0.0.1:${dockerEnv.CASEPILOT_FIREBASE_AUTH_EMULATOR_PORT || '9099'}`;
  const emulatorOrigin = assertLoopbackUrl(`http://${emulatorHost}`, 'Firebase Auth Emulator');
  const apiOrigin = assertLoopbackUrl(process.env.CASEPILOT_API_URL || 'http://127.0.0.1:3000', 'CasePilot API');

  const customPasswordProvided = Boolean(process.env.CASEPILOT_LOCAL_SEED_PASSWORD);
  const password = process.env.CASEPILOT_LOCAL_SEED_PASSWORD || DEFAULT_LOCAL_PASSWORD;

  await assertServicesReachable(emulatorOrigin, apiOrigin);

  const seeded = [];
  for (const user of SEED_USERS) {
    const authUser = await ensureEmulatorUser(emulatorOrigin, user, password);
    const apiUser = await bootstrapUser(apiOrigin, authUser.idToken);
    seeded.push({
      ...user,
      uid: authUser.localId,
      idToken: authUser.idToken,
      userId: apiUser.userId,
      emulatorCreated: authUser.emulatorCreated,
      apiProvisioned: apiUser.provisioned,
    });
  }

  const owner = seeded.find(entry => entry.teamRole === 'OWNER');
  const team = await ensureSharedTeamAccount(apiOrigin, owner.idToken, owner.email);
  const addedMembers = await ensureTeamMemberships(apiOrigin, owner.idToken, team.accountId, seeded);

  console.log('\nLocal seed completed (idempotent):');
  for (const entry of seeded) {
    const authState = entry.emulatorCreated ? 'created' : 'existing';
    const apiState = entry.apiProvisioned ? 'provisioned' : 'existing';
    console.log(`  - ${entry.email.padEnd(20)} role=${entry.teamRole.padEnd(6)} auth=${authState} api=${apiState}`);
  }
  console.log(`\nShared workspace: ${SHARED_ACCOUNT_NAME} (${team.accountId}, ${team.created ? 'created' : 'existing'})`);
  if (addedMembers.length > 0) {
    console.log(`Added memberships: ${addedMembers.join(', ')}`);
  }
  if (!customPasswordProvided) {
    console.log(`Default local emulator password: ${DEFAULT_LOCAL_PASSWORD} (override with CASEPILOT_LOCAL_SEED_PASSWORD)`);
  } else {
    console.log('Used password from CASEPILOT_LOCAL_SEED_PASSWORD.');
  }
}

main().catch(error => {
  console.error(`\n[seed:local] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
