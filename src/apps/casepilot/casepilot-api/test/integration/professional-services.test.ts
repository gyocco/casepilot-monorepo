import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { QueryFailedError } from 'typeorm';
import { startApiFixture, type ApiFixture } from './support/api-fixture.js';
import { resourceFixtures } from './support/professional-services-fixtures.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function record(value: unknown): Record<string, unknown> {
  assert.ok(isRecord(value));
  return value;
}
function id(value: Record<string, unknown>): string { assert.equal(typeof value.id, 'string'); return String(value.id); }
function version(value: Record<string, unknown>): number { assert.equal(typeof value.version, 'number'); return Number(value.version); }
async function json(response: Response, status: number): Promise<Record<string, unknown>> {
  const value: unknown = await response.json();
  assert.equal(response.status, status, JSON.stringify(value));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type') ?? '', status >= 400 ? /application\/problem\+json/ : /application\/json/);
  if (status >= 400) assert.doesNotMatch(JSON.stringify(value), /QueryFailedError|INSERT INTO|UPDATE .* SET|password|23503|23505/);
  return record(value);
}

void describe('professional services CRUD with migrated, isolated PostgreSQL', { concurrency: false }, () => {
  let fixture: ApiFixture;
  const ids: Record<string, string> = {};
  const items: Record<string, Record<string, unknown>> = {};
  let otherAccount: string;
  let otherMember: string;
  function path(resource: string): string { return `/business-accounts/${ids['business-accounts']}/${resource}`; }

  before(async () => {
    fixture = await startApiFixture();
    for (const definition of resourceFixtures) {
      const route = definition.tenant ? path(definition.resource) : `/${definition.resource}`;
      const body = await json(await fixture.request(route, 'POST', definition.data(ids)), 201);
      const item = record(body.item);
      ids[definition.resource] = id(item);
      items[definition.resource] = item;
      assert.equal(version(item), 1);
      if (definition.tenant) assert.equal(item.businessAccountId, ids['business-accounts']);
    }
  }, { timeout: 180000 });
  after(async () => { if (fixture) await fixture.close(); }, { timeout: 60000 });

  for (const definition of resourceFixtures) {
    void it(`${definition.resource}: create, read, partial update and paginated list use the same persisted data`, async () => {
      const route = definition.tenant ? path(definition.resource) : `/${definition.resource}`;
      const original = items[definition.resource];
      const read = await json(await fixture.request(`${route}/${id(original)}`), 200);
      assert.deepEqual(read.item, original);
      const updated = record((await json(await fixture.request(`${route}/${id(original)}`, 'PATCH', { version: 1, ...definition.patch }), 200)).item);
      assert.equal(updated.version, 2);
      assert.equal(updated.id, original.id);
      assert.equal(updated.createdAt, original.createdAt);
      for (const [key, value] of Object.entries(definition.patch)) assert.deepEqual(updated[key], value);
      items[definition.resource] = updated;
      assert.deepEqual((await json(await fixture.request(`${route}/${id(original)}`), 200)).item, updated);
      const page = await json(await fixture.request(`${route}?pageNumber=1&pageSize=1&sortBy=createdAt&sortDirection=desc`), 200);
      assert.deepEqual(page.items, [updated]);
      assert.deepEqual(page.pagination, { pageNumber: 1, pageSize: 1, totalCount: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false });
      const empty = await json(await fixture.request(`${route}?pageNumber=2&pageSize=1`), 200);
      assert.deepEqual(empty.items, []);
      assert.equal(record(empty.pagination).totalCount, 1);
    });
  }

  void it('keeps decimal amounts, bigint sizes, JSON, nullable fields and timestamps lossless', async () => {
    assert.equal(items['document-versions'].sizeBytes, '9007199254740993');
    assert.equal(items.expenses.amount, '25.0000');
    assert.equal(items.payments.paidAt, '2026-10-02T12:00:00.000Z');
    const account = items['business-accounts'];
    const settings = { nested: [{ label: 'fixture', enabled: true }], amount: '25.0000' };
    const updated = record((await json(await fixture.request(`/business-accounts/${id(account)}`, 'PATCH', { version: version(account), settings, legalName: 'Legal fixture' }), 200)).item);
    assert.deepEqual(updated.settings, settings);
    const cleared = record((await json(await fixture.request(`/business-accounts/${id(account)}`, 'PATCH', { version: version(updated), legalName: null }), 200)).item);
    assert.equal(cleared.legalName, null);
    assert.deepEqual(cleared.settings, settings);
    items['business-accounts'] = cleared;
  });

  void it('validates pagination, UUIDs, immutable fields, enum values, empty patches and date formats', async () => {
    for (const query of ['pageNumber=0', 'pageSize=101', 'pageSize=1x', 'sortBy=id;DROP TABLE users', 'sortDirection=sideways', 'pageNumber=9007199254740991&pageSize=100', 'pageSize=1&pageSize=2']) {
      await json(await fixture.request(`${path('cases')}?${query}`), 400);
    }
    await json(await fixture.request('/users/not-a-uuid'), 400);
    await json(await fixture.request(`${path('cases')}/${ids.cases}`, 'PATCH', { version: 2 }), 400);
    await json(await fixture.request(`${path('cases')}/${ids.cases}`, 'PATCH', { version: 2, businessAccountId: ids['business-accounts'] }), 400);
    await json(await fixture.request(`${path('external-parties')}/${ids['external-parties']}`, 'PATCH', { version: 2, type: 'INVALID' }), 400);
    await json(await fixture.request(`${path('events')}/${ids.events}`, 'PATCH', { version: 2, startsAt: '2026-02-30T12:00:00Z' }), 400);
    await json(await fixture.request(`${path('events')}/${ids.events}`, 'PATCH', { version: 2, endsAt: '2026-10-01T12:00:00Z' }), 400);
    await json(await fixture.request(`${path('cases')}/${ids.cases}`, 'DELETE'), 400);
    await json(await fixture.request(`${path('cases')}/00000000-0000-4000-8000-000000000099`), 404);
  });

  void it('scopes reads, updates and every foreign reference to the selected business account', async () => {
    const account = record((await json(await fixture.request('/business-accounts', 'POST', { name: 'Other account', timezone: 'UTC', locale: 'en', currency: 'USD', countryCode: 'US', status: 'ACTIVE' }), 201)).item);
    otherAccount = id(account);
    const member = record((await json(await fixture.request(`/business-accounts/${otherAccount}/members`, 'POST', { userId: ids.users, role: 'OWNER', status: 'ACTIVE' }), 201)).item);
    otherMember = id(member);
    const foreignPath = `/business-accounts/${otherAccount}/cases`;
    const empty = await json(await fixture.request(foreignPath), 200);
    assert.deepEqual(empty.items, []);
    await json(await fixture.request(`${foreignPath}/${ids.cases}`), 404);
    await json(await fixture.request(`${foreignPath}/${ids.cases}`, 'PATCH', { version: 2, title: 'Forbidden relationship' }), 404);
    await json(await fixture.request(`${foreignPath}/${ids.cases}?version=2`, 'DELETE'), 404);
    await json(await fixture.request(path('case-members'), 'POST', { caseId: ids.cases, memberId: otherMember, isPrimary: false, assignedAt: '2026-10-02T12:00:00Z' }), 400);
    await json(await fixture.request(`/business-accounts/${otherAccount}/comments`, 'POST', { authorMemberId: otherMember, targetType: 'CASE', targetId: ids.cases, body: 'Cross account' }), 400);
    await assert.rejects(fixture.database.query('INSERT INTO case_members (business_account_id, case_id, member_id, is_primary, assigned_at) VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)', [ids['business-accounts'], ids.cases, otherMember]), (error: unknown) => error instanceof QueryFailedError);
    assert.equal((await fixture.database.getRepository('CaseMember').count()), 1);
  });

  void it('reports uniqueness conflicts and keeps the original record after transaction rollback', async () => {
    await json(await fixture.request('/users', 'POST', { email: 'ADA@example.test', firstName: 'Other', lastName: 'Fixture', status: 'ACTIVE' }), 409);
    await json(await fixture.request(path('members'), 'POST', { userId: ids.users, role: 'MEMBER', status: 'ACTIVE' }), 409);
    const before = items.invoices;
    const another = record((await json(await fixture.request(path('invoices'), 'POST', { externalPartyId: ids['external-parties'], number: 'OTHER-001', status: 'DRAFT', currency: 'UYU', issueDate: '2026-10-02', subtotal: '10', taxAmount: '0', total: '10', balanceDue: '10' }), 201)).item);
    await json(await fixture.request(`${path('invoices')}/${id(another)}`, 'PATCH', { version: 1, number: before.number, notes: 'Must roll back' }), 409);
    assert.deepEqual((await json(await fixture.request(`${path('invoices')}/${id(another)}`), 200)).item, another);
    await json(await fixture.request(`${path('invoices')}/${id(another)}?version=1`, 'DELETE'), 200);
  });

  void it('allows only one concurrent update of the same version', async () => {
    const user = items.users;
    const responses = await Promise.all(['First concurrent value', 'Second concurrent value'].map(displayName => fixture.request(`/users/${id(user)}`, 'PATCH', { version: version(user), displayName })));
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
    for (const response of responses) await json(response, response.status);
    const current = record((await json(await fixture.request(`/users/${id(user)}`), 200)).item);
    assert.equal(version(current), version(user) + 1);
    await json(await fixture.request(`/users/${id(user)}`, 'PATCH', { version: version(user), firstName: 'Stale' }), 409);
    items.users = current;
  });

  void it('validates folder cycles and document/version ownership in Application and PostgreSQL', async () => {
    await json(await fixture.request(`${path('folders')}/${ids.folders}`, 'PATCH', { version: 2, parentFolderId: ids.folders }), 400);
    const child = record((await json(await fixture.request(path('folders'), 'POST', { name: 'Child', parentFolderId: ids.folders, createdByMemberId: ids.members }), 201)).item);
    await json(await fixture.request(`${path('folders')}/${ids.folders}`, 'PATCH', { version: 2, parentFolderId: id(child) }), 400);
    await json(await fixture.request(`${path('folders')}/${id(child)}?version=1`, 'DELETE'), 200);
    const another = record((await json(await fixture.request(path('documents'), 'POST', { name: 'Another document', createdByMemberId: ids.members }), 201)).item);
    await json(await fixture.request(`${path('documents')}/${id(another)}`, 'PATCH', { version: 1, currentVersionId: ids['document-versions'] }), 400);
    await assert.rejects(fixture.database.query('UPDATE documents SET current_version_id = $1 WHERE id = $2', [ids['document-versions'], id(another)]), (error: unknown) => error instanceof QueryFailedError);
    const selected = record((await json(await fixture.request(`${path('documents')}/${ids.documents}`, 'PATCH', { version: 2, currentVersionId: ids['document-versions'] }), 200)).item);
    const cleared = record((await json(await fixture.request(`${path('documents')}/${ids.documents}`, 'PATCH', { version: version(selected), currentVersionId: null }), 200)).item);
    items.documents = cleared;
    await json(await fixture.request(`${path('documents')}/${id(another)}?version=1`, 'DELETE'), 200);
  });

  void it('orders pages deterministically and returns a consistent total outside the last page', async () => {
    const created: Record<string, unknown>[] = [];
    for (let index = 0; index < 3; index++) created.push(record((await json(await fixture.request(path('workflows'), 'POST', { name: 'Same name', isActive: true }), 201)).item));
    const first = await json(await fixture.request(`${path('workflows')}?pageSize=2&sortBy=name`), 200);
    const second = await json(await fixture.request(`${path('workflows')}?pageNumber=2&pageSize=2&sortBy=name`), 200);
    assert.equal(record(first.pagination).totalCount, 4);
    assert.equal(record(first.pagination).hasNextPage, true);
    assert.equal(record(second.pagination).hasPreviousPage, true);
    assert.ok(Array.isArray(first.items) && Array.isArray(second.items));
    const firstItems: readonly unknown[] = first.items;
    const secondItems: readonly unknown[] = second.items;
    assert.equal(new Set([...firstItems, ...secondItems].map(item => id(record(item)))).size, 4);
    assert.deepEqual((await json(await fixture.request(`${path('workflows')}?pageNumber=4&pageSize=2`), 200)).items, []);
    for (const item of created) await json(await fixture.request(`${path('workflows')}/${id(item)}?version=1`, 'DELETE'), 200);
  });

  void it('keeps schema metadata synchronized with the versioned migration', async () => {
    const changes = await fixture.database.driver.createSchemaBuilder().log();
    assert.equal(changes.upQueries.length, 0, JSON.stringify(changes.upQueries.slice(0, 5).map(query => query.query)));
    assert.equal(await fixture.database.showMigrations(), false);
  });

  void it('rejects deleting referenced parents, then deletes all 28 resources explicitly without cascades', async () => {
    await json(await fixture.request(`/business-accounts/${ids['business-accounts']}?version=${version(items['business-accounts'])}`, 'DELETE'), 409);
    await json(await fixture.request(`/business-accounts/${otherAccount}/members/${otherMember}?version=1`, 'DELETE'), 200);
    await json(await fixture.request(`/business-accounts/${otherAccount}?version=1`, 'DELETE'), 200);
    for (const definition of [...resourceFixtures].reverse()) {
      const route = definition.tenant ? path(definition.resource) : `/${definition.resource}`;
      const item = items[definition.resource];
      const response = await json(await fixture.request(`${route}/${id(item)}?version=${version(item)}`, 'DELETE'), 200);
      assert.deepEqual(response, { id: id(item), deleted: true });
      await json(await fixture.request(`${route}/${id(item)}`), 404);
    }
  });

  void it('reverts and reapplies the full domain migration without altering the health table', { timeout: 30000 }, async () => {
    await fixture.database.undoLastMigration({ transaction: 'all' });
    const runner = fixture.database.createQueryRunner();
    try {
      for (const definition of resourceFixtures) assert.equal(await runner.hasTable(definition.resource.replaceAll('-', '_')), false);
    } finally { await runner.release(); }
    await json(await fixture.get('/health/database'), 200);
    await fixture.database.runMigrations({ transaction: 'all' });
    assert.equal(await fixture.database.getRepository('User').count(), 0);
    assert.equal(await fixture.database.showMigrations(), false);
  });
});
