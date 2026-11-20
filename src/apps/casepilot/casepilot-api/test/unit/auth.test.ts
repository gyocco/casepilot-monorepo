import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConflictError, ForbiddenError, ValidationError, type UnitOfWork } from '@casepilot/abstractions';
import type { VerifiedIdentity } from '@casepilot/auth';
import { BootstrapCurrentUserHandler } from '../../src/application/auth/bootstrap-current-user/bootstrap-current-user.handler.js';
import { BootstrapCurrentUserRequest } from '../../src/application/auth/bootstrap-current-user/bootstrap-current-user.request.js';
import { GetCurrentUserProfileHandler } from '../../src/application/auth/get-current-user-profile/get-current-user-profile.handler.js';
import { GetCurrentUserProfileRequest } from '../../src/application/auth/get-current-user-profile/get-current-user-profile.request.js';
import type { AuthScope } from '../../src/application/auth/shared/current-user-profile.response.js';
import { UpdateCurrentUserProfileHandler } from '../../src/application/auth/update-current-user-profile/update-current-user-profile.handler.js';
import { UpdateCurrentUserProfileRequest } from '../../src/application/auth/update-current-user-profile/update-current-user-profile.request.js';
import { BusinessAccount } from '../../src/domain/entities/business-account.js';
import { Member } from '../../src/domain/entities/member.js';
import { User } from '../../src/domain/entities/user.js';
import { UserIdentity } from '../../src/domain/entities/user-identity.js';

function createAuthFixture() {
  const usersStore = new Map<string, User>();
  const identitiesStore = new Map<string, UserIdentity>();
  const accountsStore = new Map<string, BusinessAccount>();
  const membersStore = new Map<string, Member>();
  let seq = 1;
  const runtime = {
    newId: (): string => `00000000-0000-4000-8000-${String(seq++).padStart(12, '0')}`,
    now: (): string => '2026-11-20T12:00:00.000Z',
  };

  const scope: AuthScope = {
    users: {
      getById: (id): Promise<User | null> => Promise.resolve(usersStore.get(id) ?? null),
      getByEmail: (email): Promise<User | null> =>
        Promise.resolve([...usersStore.values()].find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null),
      getPage: (): Promise<readonly User[]> => Promise.resolve([...usersStore.values()]),
      count: (): Promise<number> => Promise.resolve(usersStore.size),
      add: (entity): Promise<User> => { usersStore.set(entity.id, entity); return Promise.resolve(entity); },
      update: (entity, _tenant, expectedVersion): Promise<User | null> => {
        const current = usersStore.get(entity.id);
        if (!current || current.version !== expectedVersion) return Promise.resolve(null);
        usersStore.set(entity.id, entity);
        return Promise.resolve(entity);
      },
      delete: (id): Promise<boolean> => Promise.resolve(usersStore.delete(id)),
    },
    userIdentities: {
      getByProviderSubject: (provider, subject): Promise<UserIdentity | null> =>
        Promise.resolve(identitiesStore.get(`${provider}:${subject}`) ?? null),
      getById: (id): Promise<UserIdentity | null> =>
        Promise.resolve([...identitiesStore.values()].find(item => item.id === id) ?? null),
      getPage: (): Promise<readonly UserIdentity[]> => Promise.resolve([...identitiesStore.values()]),
      count: (): Promise<number> => Promise.resolve(identitiesStore.size),
      add: (entity): Promise<UserIdentity> => {
        identitiesStore.set(`${entity.provider}:${entity.subject}`, entity);
        return Promise.resolve(entity);
      },
      update: (entity): Promise<UserIdentity | null> => Promise.resolve(entity),
      delete: (): Promise<boolean> => Promise.resolve(true),
    },
    members: {
      getByUserAndAccount: (userId, accountId): Promise<Member | null> =>
        Promise.resolve([...membersStore.values()].find(m => m.userId === userId && m.businessAccountId === accountId) ?? null),
      listByUser: (userId): Promise<readonly Member[]> =>
        Promise.resolve([...membersStore.values()].filter(m => m.userId === userId)),
      getById: (id): Promise<Member | null> => Promise.resolve(membersStore.get(id) ?? null),
      getPage: (): Promise<readonly Member[]> => Promise.resolve([...membersStore.values()]),
      count: (): Promise<number> => Promise.resolve(membersStore.size),
      add: (entity): Promise<Member> => { membersStore.set(entity.id, entity); return Promise.resolve(entity); },
      update: (entity): Promise<Member | null> => { membersStore.set(entity.id, entity); return Promise.resolve(entity); },
      delete: (id): Promise<boolean> => Promise.resolve(membersStore.delete(id)),
    },
    businessAccounts: {
      listByIds: (ids): Promise<readonly BusinessAccount[]> =>
        Promise.resolve(ids.map(id => accountsStore.get(id)).filter((a): a is BusinessAccount => a !== undefined)),
      getById: (id): Promise<BusinessAccount | null> => Promise.resolve(accountsStore.get(id) ?? null),
      getPage: (): Promise<readonly BusinessAccount[]> => Promise.resolve([...accountsStore.values()]),
      count: (): Promise<number> => Promise.resolve(accountsStore.size),
      add: (entity): Promise<BusinessAccount> => { accountsStore.set(entity.id, entity); return Promise.resolve(entity); },
      update: (entity): Promise<BusinessAccount | null> => { accountsStore.set(entity.id, entity); return Promise.resolve(entity); },
      delete: (id): Promise<boolean> => Promise.resolve(accountsStore.delete(id)),
    },
  };

  const work: UnitOfWork<AuthScope> = { execute: operation => operation(scope) };
  return { work, runtime, usersStore, accountsStore, membersStore };
}

const adaActor: VerifiedIdentity = {
  provider: 'firebase',
  subject: 'uid-ada',
  email: 'ada@casepilot.test',
  emailVerified: true,
  displayName: 'Ada Lovelace',
};

void test('BootstrapCurrentUserHandler provisions User, UserIdentity, BusinessAccount and OWNER Member idempotently', async () => {
  const { work, runtime, usersStore, accountsStore, membersStore } = createAuthFixture();
  const bootstrap = new BootstrapCurrentUserHandler(work, runtime);

  const first = await bootstrap.execute(new BootstrapCurrentUserRequest(adaActor));
  assert.equal(first.provisioned, true);
  assert.equal(first.profile.email, 'ada@casepilot.test');
  assert.equal(first.profile.firstName, 'Ada');
  assert.equal(first.profile.lastName, 'Lovelace');
  assert.equal(first.profile.memberships.length, 1);
  assert.equal(first.profile.memberships[0]?.role, 'OWNER');
  assert.equal(usersStore.size, 1);
  assert.equal(accountsStore.size, 1);
  assert.equal(membersStore.size, 1);

  const second = await bootstrap.execute(new BootstrapCurrentUserRequest(adaActor));
  assert.equal(second.provisioned, false);
  assert.equal(second.profile.id, first.profile.id);
  assert.equal(usersStore.size, 1);
  assert.equal(accountsStore.size, 1);
});

void test('GetCurrentUserProfileHandler is a pure query rejecting unprovisioned actors and returning active memberships', async () => {
  const { work, runtime } = createAuthFixture();
  const getProfile = new GetCurrentUserProfileHandler(work);

  await assert.rejects(getProfile.execute(new GetCurrentUserProfileRequest(adaActor)), ForbiddenError);

  await new BootstrapCurrentUserHandler(work, runtime).execute(new BootstrapCurrentUserRequest(adaActor));
  const profile = await getProfile.execute(new GetCurrentUserProfileRequest(adaActor));
  assert.equal(profile.profile.email, 'ada@casepilot.test');
  assert.equal(profile.profile.memberships.length, 1);
});

void test('UpdateCurrentUserProfileHandler updates allowed profile fields with optimistic concurrency and rejects empty patches', async () => {
  const { work, runtime } = createAuthFixture();
  await new BootstrapCurrentUserHandler(work, runtime).execute(new BootstrapCurrentUserRequest(adaActor));

  const update = new UpdateCurrentUserProfileHandler(work, runtime);
  const updated = await update.execute(new UpdateCurrentUserProfileRequest(adaActor, 1, {
    firstName: 'Augusta',
    displayName: 'Augusta Ada',
    timezone: 'America/Montevideo',
  }));
  assert.equal(updated.profile.version, 2);
  assert.equal(updated.profile.firstName, 'Augusta');
  assert.equal(updated.profile.lastName, 'Lovelace');
  assert.equal(updated.profile.displayName, 'Augusta Ada');
  assert.equal(updated.profile.timezone, 'America/Montevideo');

  await assert.rejects(update.execute(new UpdateCurrentUserProfileRequest(adaActor, 1, { firstName: 'Stale' })), ConflictError);
  await assert.rejects(update.execute(new UpdateCurrentUserProfileRequest(adaActor, 2, {})), ValidationError);
});

void test('BootstrapCurrentUserHandler refuses linking an existing user if email is unverified', async () => {
  const { work, runtime, usersStore } = createAuthFixture();
  const existing = new User();
  existing.id = runtime.newId();
  existing.createdAt = runtime.now();
  existing.updatedAt = runtime.now();
  existing.version = 1;
  existing.email = 'ada@casepilot.test';
  existing.emailVerifiedAt = null;
  existing.firstName = 'Ada';
  existing.lastName = 'Lovelace';
  existing.displayName = null;
  existing.avatarUrl = null;
  existing.locale = null;
  existing.timezone = null;
  existing.status = 'ACTIVE';
  existing.lastLoginAt = null;
  usersStore.set(existing.id, existing);

  const bootstrap = new BootstrapCurrentUserHandler(work, runtime);
  await assert.rejects(
    bootstrap.execute(new BootstrapCurrentUserRequest({ ...adaActor, emailVerified: false })),
    ForbiddenError,
  );
});
