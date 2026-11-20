import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError, type ScopedDataRepository as DataRepository, type UnitOfWork } from '@casepilot/abstractions';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CreateNoteHandler } from '../../src/application/notes/create-note/create-note.handler.js';
import { CreateNoteRequest } from '../../src/application/notes/create-note/create-note.request.js';
import { UpdateNoteHandler } from '../../src/application/notes/update-note/update-note.handler.js';
import { UpdateNoteRequest } from '../../src/application/notes/update-note/update-note.request.js';
import { ListNotesHandler } from '../../src/application/notes/list-notes/list-notes.handler.js';
import { ListNotesRequest } from '../../src/application/notes/list-notes/list-notes.request.js';
import type { CrudScope } from '../../src/application/shared/crud-models.js';
import type { MemberRepository } from '../../src/domain/repositories/member.repository.js';
import type { ReferenceRepository } from '../../src/domain/repositories/reference.repository.js';
import type { UserIdentityRepository } from '../../src/domain/repositories/user-identity.repository.js';
import type { UserRepository } from '../../src/domain/repositories/user.repository.js';
import { Member } from '../../src/domain/entities/member.js';
import { Note } from '../../src/domain/entities/note.js';
import { ReferenceRecord } from '../../src/domain/entities/reference-record.js';
import { User } from '../../src/domain/entities/user.js';
import { UserIdentity } from '../../src/domain/entities/user-identity.js';

const accountId = '00000000-0000-4000-8000-000000000001';
const memberId = '00000000-0000-4000-8000-000000000002';
const noteId = '00000000-0000-4000-8000-000000000003';
const foreignAccountId = '00000000-0000-4000-8000-000000000004';
const userId = '00000000-0000-4000-8000-000000000010';
const runtime = { newId: (): string => noteId, now: (): string => '2026-10-02T12:00:00.000Z' };

const defaultActor: VerifiedIdentity = {
  provider: 'firebase',
  subject: 'firebase-uid-1',
  email: 'ada@example.test',
  emailVerified: true,
  displayName: 'Ada Lovelace',
};

function fixture(options: {
  readonly foreignMember?: boolean;
  readonly missingAccount?: boolean;
  readonly noMatch?: boolean;
  readonly role?: string;
  readonly memberStatus?: Member['status'];
  readonly userStatus?: string;
  readonly unprovisioned?: boolean;
} = {}) {
  let saved: Note | null = null;
  let writes = 0;
  const scopes: (string | null)[] = [];
  const activeUser = new User();
  activeUser.id = userId;
  activeUser.email = 'ada@example.test';
  activeUser.firstName = 'Ada';
  activeUser.lastName = 'Lovelace';
  activeUser.status = options.userStatus ?? 'ACTIVE';
  activeUser.version = 1;
  activeUser.createdAt = '2026-10-02T12:00:00.000Z';
  activeUser.updatedAt = '2026-10-02T12:00:00.000Z';

  const identity = new UserIdentity();
  identity.id = '00000000-0000-4000-8000-000000000011';
  identity.userId = userId;
  identity.provider = defaultActor.provider;
  identity.subject = defaultActor.subject;
  identity.version = 1;
  identity.createdAt = '2026-10-02T12:00:00.000Z';
  identity.updatedAt = '2026-10-02T12:00:00.000Z';

  const member = new Member();
  member.id = memberId;
  member.businessAccountId = accountId;
  member.userId = userId;
  member.role = options.role ?? 'OWNER';
  member.status = options.memberStatus ?? 'ACTIVE';
  member.version = 1;
  member.createdAt = '2026-10-02T12:00:00.000Z';
  member.updatedAt = '2026-10-02T12:00:00.000Z';

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
  const users: UserRepository = {
    getById: (id): Promise<User | null> => Promise.resolve(id === userId ? activeUser : null),
    getByEmail: (): Promise<User | null> => Promise.resolve(activeUser),
    getPage: (): Promise<readonly User[]> => Promise.resolve([activeUser]),
    count: (): Promise<number> => Promise.resolve(1),
    add: (entity): Promise<User> => Promise.resolve(entity),
    update: (entity): Promise<User | null> => Promise.resolve(entity),
    delete: (): Promise<boolean> => Promise.resolve(true),
  };
  const userIdentities: UserIdentityRepository = {
    getByProviderSubject: (_provider, subject): Promise<UserIdentity | null> =>
      Promise.resolve(!options.unprovisioned && subject === defaultActor.subject ? identity : null),
    getById: (): Promise<UserIdentity | null> => Promise.resolve(identity),
    getPage: (): Promise<readonly UserIdentity[]> => Promise.resolve([identity]),
    count: (): Promise<number> => Promise.resolve(1),
    add: (entity): Promise<UserIdentity> => Promise.resolve(entity),
    update: (entity): Promise<UserIdentity | null> => Promise.resolve(entity),
    delete: (): Promise<boolean> => Promise.resolve(true),
  };
  const members: MemberRepository = {
    getByUserAndAccount: (uId, accId): Promise<Member | null> =>
      Promise.resolve(uId === userId && accId === accountId ? member : null),
    listByUser: (uId): Promise<readonly Member[]> => Promise.resolve(uId === userId ? [member] : []),
    getById: (): Promise<Member | null> => Promise.resolve(member),
    getPage: (): Promise<readonly Member[]> => Promise.resolve([member]),
    count: (): Promise<number> => Promise.resolve(1),
    add: (entity): Promise<Member> => Promise.resolve(entity),
    update: (entity): Promise<Member | null> => Promise.resolve(entity),
    delete: (): Promise<boolean> => Promise.resolve(true),
  };

  const scope: CrudScope<Note> = { resource, references, users, userIdentities, members };
  const work: UnitOfWork<CrudScope<Note>> = {
    execute: operation => operation(scope),
  };
  return { work, scopes, writes: (): number => writes };
}

void test('Application creates a scoped note, chooses its own metadata and maps a concrete response', async () => {
  const setup = fixture();
  const result = await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false }, defaultActor));
  assert.equal(result.item.id, noteId);
  assert.equal(result.item.businessAccountId, accountId);
  assert.equal(result.item.version, 1);
  assert.equal(result.item.caseId, null);
  assert.equal(setup.writes(), 1);
});

void test('Application enforces BCK-006 authorization for unprovisioned actors, foreign accounts, suspended users and read-only roles', async () => {
  const unprovisioned = fixture({ unprovisioned: true });
  await assert.rejects(new CreateNoteHandler(unprovisioned.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Denied', isPrivate: false }, defaultActor)), ForbiddenError);

  const foreign = fixture();
  await assert.rejects(new ListNotesHandler(foreign.work).execute(new ListNotesRequest(foreignAccountId, 1, 20, 'id', 'asc', defaultActor)), ForbiddenError);

  const suspended = fixture({ userStatus: 'SUSPENDED' });
  await assert.rejects(new ListNotesHandler(suspended.work).execute(new ListNotesRequest(accountId, 1, 20, 'id', 'asc', defaultActor)), ForbiddenError);

  const viewer = fixture({ role: 'VIEWER' });
  await assert.rejects(new CreateNoteHandler(viewer.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Denied', isPrivate: false }, defaultActor)), ForbiddenError);
  const viewerRead = await new ListNotesHandler(viewer.work).execute(new ListNotesRequest(accountId, 1, 20, 'id', 'asc', defaultActor));
  assert.deepEqual(viewerRead.items, []);
  assert.equal(viewer.writes(), 0);
});

void test('Application rejects foreign-account references without trusting a repository result', async () => {
  const setup = fixture({ foreignMember: true });
  await assert.rejects(new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false }, defaultActor)), ValidationError);
  assert.equal(setup.writes(), 0);
});

void test('Application rejects missing accounts and malformed inputs when invoked without HTTP', async () => {
  const missing = fixture({ missingAccount: true });
  await assert.rejects(new CreateNoteHandler(missing.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Test note', isPrivate: false }, defaultActor)), NotFoundError);
  const invalid = fixture();
  await assert.rejects(new CreateNoteHandler(invalid.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: 'invalid', body: 'Test note', isPrivate: false }, defaultActor)), ValidationError);
  assert.equal(invalid.writes(), 0);
});

void test('Application preserves omitted fields and rejects stale versions and empty partial updates', async () => {
  const setup = fixture();
  await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Original', isPrivate: false, title: 'Original title' }, defaultActor));
  const handler = new UpdateNoteHandler(setup.work, runtime);
  const result = await handler.execute(new UpdateNoteRequest(accountId, noteId, 1, { title: null }, defaultActor));
  assert.equal(result.item.body, 'Original');
  assert.equal(result.item.title, null);
  assert.equal(result.item.version, 2);
  await assert.rejects(handler.execute(new UpdateNoteRequest(accountId, noteId, 1, { body: 'Stale' }, defaultActor)), ConflictError);
  await assert.rejects(handler.execute(new UpdateNoteRequest(accountId, noteId, 2, { body: undefined, title: undefined }, defaultActor)), ValidationError);
  assert.equal(setup.writes(), 2);
});

void test('Application reports a conditional write conflict rather than returning an unpersisted response', async () => {
  const setup = fixture({ noMatch: true });
  await new CreateNoteHandler(setup.work, runtime).execute(new CreateNoteRequest(accountId, { authorMemberId: memberId, body: 'Original', isPrivate: false }, defaultActor));
  await assert.rejects(new UpdateNoteHandler(setup.work, runtime).execute(new UpdateNoteRequest(accountId, noteId, 1, { body: 'Lost update' }, defaultActor)), ConflictError);
  assert.equal(setup.writes(), 1);
});

void test('Application coordinates scoped item/count reads and validates pagination independently of HTTP', async () => {
  const setup = fixture();
  const handler = new ListNotesHandler(setup.work);
  const response = await handler.execute(new ListNotesRequest(accountId, 1, 20, 'id', 'asc', defaultActor));
  assert.deepEqual(response.items, []);
  assert.equal(response.pagination.totalCount, 0);
  assert.deepEqual(setup.scopes, [null, accountId, accountId]);
  for (const request of [new ListNotesRequest(accountId, 0, 20, 'id', 'asc', defaultActor), new ListNotesRequest(accountId, 1, 101, 'id', 'asc', defaultActor), new ListNotesRequest(accountId, 1, 20, 'bad', 'asc', defaultActor)]) await assert.rejects(handler.execute(request), ValidationError);
  assert.equal(setup.writes(), 0);
});
