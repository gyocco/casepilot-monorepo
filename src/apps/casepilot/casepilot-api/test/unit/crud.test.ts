import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NotFoundError, ValidationError, type UnitOfWork } from '@casepilot/abstractions';
import { CreateNoteHandler } from '../../src/application/notes/create-note.handler.js';
import { CreateNoteRequest } from '../../src/application/notes/note.models.js';
import { UpdateNoteHandler } from '../../src/application/notes/update-note.handler.js';
import { UpdateNoteRequest } from '../../src/application/notes/note.models.js';
import { ListNotesHandler } from '../../src/application/notes/list-notes.handler.js';
import { ListNotesRequest } from '../../src/application/notes/note.models.js';
import { ConflictError } from '@casepilot/abstractions';
import type { CrudScope } from '../../src/application/shared/crud-models.js';
import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { ReferenceRepository } from '../../src/domain/repositories/reference.repository.js';
import { ReferenceRecord } from '../../src/domain/entities/reference-record.js';
import { Note } from '../../src/domain/entities/note.js';

const accountId = '00000000-0000-4000-8000-000000000001';
const memberId = '00000000-0000-4000-8000-000000000002';
const noteId = '00000000-0000-4000-8000-000000000003';
const foreignAccountId = '00000000-0000-4000-8000-000000000004';
const runtime = { newId: (): string => noteId, now: (): string => '2026-10-02T12:00:00.000Z' };

function fixture(options: { readonly foreignMember?: boolean; readonly missingAccount?: boolean; readonly noMatch?: boolean } = {}) {
  let saved: Note | null = null;
  let writes = 0;
  const scopes: (string | null)[] = [];
  const resource: DataRepository<Note> = {
    getById: (_id, tenant): Promise<Note | null> => { scopes.push(tenant); return Promise.resolve(saved); },
    getPage: (_page, tenant): Promise<readonly Note[]> => { scopes.push(tenant); return Promise.resolve(saved ? [saved] : []); },
    count: (tenant): Promise<number> => { scopes.push(tenant); return Promise.resolve(saved ? 1 : 0); },
    add: (entity): Promise<Note> => { writes++; saved = entity; return Promise.resolve(entity); },
    update: (entity, tenant, _version): Promise<Note | null> => {
      scopes.push(tenant);
      if (options.noMatch) return Promise.resolve(null);
      writes++; saved = entity; return Promise.resolve(entity);
    },
    delete: (_id, tenant, _version): Promise<boolean> => { scopes.push(tenant); writes++; saved = null; return Promise.resolve(true); },
  };
  const references: ReferenceRepository = {
    find: (kind, id, tenant): Promise<ReferenceRecord | null> => {
      scopes.push(tenant);
      if (kind === 'business_accounts') return Promise.resolve(options.missingAccount ? null : new ReferenceRecord(id, null, null, null));
      return Promise.resolve(new ReferenceRecord(id, options.foreignMember ? foreignAccountId : tenant, null, null));
    },
  };
  const scope = { resource, references };
  const work: UnitOfWork<CrudScope<Note>> = {
    execute: operation => operation(scope),
  };
  return { work, scopes, writes: (): number => writes };
}

void test('Application creates a scoped note, chooses its own metadata and maps a concrete response', async () => {
  const setup = fixture();
  const result = await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false }));
  assert.equal(result.item.id, noteId);
  assert.equal(result.item.businessAccountId, accountId);
  assert.equal(result.item.version, 1);
  assert.equal(result.item.caseId, null);
  assert.equal(setup.writes(), 1);
});

void test('Application rejects foreign-account references without trusting a repository result', async () => {
  const setup = fixture({ foreignMember: true });
  await assert.rejects(new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false })), ValidationError);
  assert.equal(setup.writes(), 0);
});

void test('Application rejects missing accounts and malformed inputs when invoked without HTTP', async () => {
  const missing = fixture({ missingAccount: true });
  await assert.rejects(new CreateNoteHandler(missing.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false })), NotFoundError);
  const invalid = fixture();
  await assert.rejects(new CreateNoteHandler(invalid.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: 'invalid', body: 'Test note', isPrivate: false })), ValidationError);
  assert.equal(invalid.writes(), 0);
});

void test('Application preserves omitted fields and rejects stale versions and empty partial updates', async () => {
  const setup = fixture();
  await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Original', isPrivate: false, title: 'Original title' }));
  const handler = new UpdateNoteHandler(setup.work, runtime);
  const result = await handler.execute(new UpdateNoteRequest(accountId, noteId, 1, { title: null }));
  assert.equal(result.item.body, 'Original');
  assert.equal(result.item.title, null);
  assert.equal(result.item.version, 2);
  await assert.rejects(handler.execute(new UpdateNoteRequest(accountId, noteId, 1, { body: 'Stale' })), ConflictError);
  await assert.rejects(handler.execute(new UpdateNoteRequest(accountId, noteId, 2, { body: undefined, title: undefined })), ValidationError);
  assert.equal(setup.writes(), 2);
});

void test('Application reports a conditional write conflict rather than returning an unpersisted response', async () => {
  const setup = fixture({ noMatch: true });
  await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Original', isPrivate: false }));
  await assert.rejects(new UpdateNoteHandler(setup.work, runtime).execute(new UpdateNoteRequest(accountId, noteId, 1, { body: 'Lost update' })), ConflictError);
  assert.equal(setup.writes(), 1);
});

void test('Application coordinates scoped item/count reads and validates pagination independently of HTTP', async () => {
  const setup = fixture();
  const handler = new ListNotesHandler(setup.work);
  const response = await handler.execute(new ListNotesRequest(accountId, 1, 20, 'id', 'asc'));
  assert.deepEqual(response.items, []);
  assert.equal(response.pagination.totalCount, 0);
  assert.deepEqual(setup.scopes, [null, accountId, accountId]);
  for (const request of [new ListNotesRequest(accountId, 0, 20, 'id', 'asc'), new ListNotesRequest(accountId, 1, 101, 'id', 'asc'), new ListNotesRequest(accountId, 1, 20, 'bad', 'asc')]) await assert.rejects(handler.execute(request), ValidationError);
  assert.equal(setup.writes(), 0);
});
