import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startApiFixture, type ApiFixture } from './support/api-fixture.js';

function record(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value));
  return value as Record<string, unknown>;
}

async function json(response: Response, status: number): Promise<Record<string, unknown>> {
  const value: unknown = await response.json();
  assert.equal(response.status, status, JSON.stringify(value));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type') ?? '', status >= 400 ? /application\/problem\+json/ : /application\/json/);
  return record(value);
}

void describe('authentication and Application-owned authorization with migrated PostgreSQL', { concurrency: false }, () => {
  let fixture: ApiFixture;
  let ownerAccountId = '';
  let ownerMemberId = '';
  let viewerUserId = '';

  before(async () => {
    fixture = await startApiFixture();
  }, { timeout: 180_000 });

  after(async () => {
    if (fixture) await fixture.close();
  }, { timeout: 60_000 });

  void it('keeps health public and rejects unauthenticated or invalid tokens with RFC 9457 401', async () => {
    assert.equal((await fixture.get('/health')).status, 200);
    assert.equal((await fixture.get('/health/database')).status, 200);

    for (const path of ['/auth/me', '/business-accounts', '/users']) {
      const missing = await json(await fixture.request(path, 'GET'), 401);
      assert.equal(missing.code, 'UNAUTHORIZED_ERROR');
      const invalid = await json(await fixture.request(path, 'GET', undefined, 'invalid-token'), 401);
      assert.equal(invalid.code, 'UNAUTHORIZED_ERROR');
    }
  });

  void it('rejects unprovisioned identities on GET /auth/me and provisions idempotently via POST /auth/me/bootstrap', async () => {
    const denied = await json(await fixture.request('/auth/me', 'GET', undefined, 'owner-token'), 403);
    assert.equal(denied.code, 'FORBIDDEN_ERROR');

    const first = await json(await fixture.request('/auth/me/bootstrap', 'POST', undefined, 'owner-token'), 201);
    assert.equal(first.provisioned, true);
    const profile = record(first.profile);
    assert.equal(profile.email, 'owner.fixture@casepilot.test');
    assert.equal(profile.version, 1);
    const memberships = profile.memberships as unknown[];
    assert.equal(memberships.length, 1);
    const primary = record(memberships[0]);
    assert.equal(primary.role, 'OWNER');
    ownerAccountId = String(primary.businessAccountId);
    ownerMemberId = String(primary.memberId);

    const second = await json(await fixture.request('/auth/me/bootstrap', 'POST', undefined, 'owner-token'), 201);
    assert.equal(second.provisioned, false);
    assert.equal(record(second.profile).id, profile.id);

    const read = await json(await fixture.request('/auth/me', 'GET', undefined, 'owner-token'), 200);
    assert.deepEqual(read.profile, profile);
  });

  void it('updates own profile fields with optimistic version check', async () => {
    const updated = await json(await fixture.request('/auth/me', 'PATCH', {
      version: 1,
      firstName: 'Updated',
      displayName: 'Updated Owner',
      timezone: 'America/Argentina/Buenos_Aires',
    }, 'owner-token'), 200);
    const profile = record(updated.profile);
    assert.equal(profile.version, 2);
    assert.equal(profile.firstName, 'Updated');
    assert.equal(profile.displayName, 'Updated Owner');
    assert.equal(profile.timezone, 'America/Argentina/Buenos_Aires');

    await json(await fixture.request('/auth/me', 'PATCH', { version: 1, firstName: 'Stale' }, 'owner-token'), 409);
    await json(await fixture.request('/auth/me', 'PATCH', { version: 2 }, 'owner-token'), 400);
  });

  void it('enforces tenant isolation and role permissions across business accounts and tenant resources', async () => {
    await json(await fixture.request('/auth/me/bootstrap', 'POST', undefined, 'outsider-token'), 201);
    const viewerBootstrap = await json(await fixture.request('/auth/me/bootstrap', 'POST', undefined, 'viewer-token'), 201);
    viewerUserId = String(record(viewerBootstrap.profile).id);

    // Owner can read own account and create cases inside it
    await json(await fixture.request(`/business-accounts/${ownerAccountId}`, 'GET', undefined, 'owner-token'), 200);
    await json(await fixture.request(`/business-accounts/${ownerAccountId}/cases`, 'POST', {
      title: 'Authorized case',
      status: 'OPEN',
      createdByMemberId: ownerMemberId,
    }, 'owner-token'), 201);

    // Outsider cannot read owner's account or cases (403 Forbidden)
    await json(await fixture.request(`/business-accounts/${ownerAccountId}`, 'GET', undefined, 'outsider-token'), 403);
    await json(await fixture.request(`/business-accounts/${ownerAccountId}/cases`, 'GET', undefined, 'outsider-token'), 403);
    await json(await fixture.request(`/business-accounts/${ownerAccountId}`, 'PATCH', {
      version: 1,
      name: 'Hijack',
    }, 'outsider-token'), 403);

    // Add viewer-token as VIEWER in owner's account
    await json(await fixture.request(`/business-accounts/${ownerAccountId}/members`, 'POST', {
      userId: viewerUserId,
      role: 'VIEWER',
      status: 'ACTIVE',
    }, 'owner-token'), 201);

    // Viewer can read account and list cases, but cannot mutate cases or account
    await json(await fixture.request(`/business-accounts/${ownerAccountId}`, 'GET', undefined, 'viewer-token'), 200);
    const casesPage = await json(await fixture.request(`/business-accounts/${ownerAccountId}/cases`, 'GET', undefined, 'viewer-token'), 200);
    assert.equal((casesPage.items as unknown[]).length, 1);
    await json(await fixture.request(`/business-accounts/${ownerAccountId}/cases`, 'POST', {
      title: 'Forbidden write',
      status: 'OPEN',
      createdByMemberId: ownerMemberId,
    }, 'viewer-token'), 403);
    await json(await fixture.request(`/business-accounts/${ownerAccountId}`, 'PATCH', {
      version: 1,
      name: 'Forbidden admin edit',
    }, 'viewer-token'), 403);
  });
});
