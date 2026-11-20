import type { Handler } from '@casepilot/cqrs';
import { ForbiddenError, ValidationError, type CrudRuntime, type UnitOfWork } from '@casepilot/abstractions';
import { BusinessAccount } from '../../../domain/entities/business-account.js';
import { Member } from '../../../domain/entities/member.js';
import { User } from '../../../domain/entities/user.js';
import { UserIdentity } from '../../../domain/entities/user-identity.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { loadCurrentUserProfile, type AuthScope } from '../shared/current-user-profile.response.js';
import type { BootstrapCurrentUserRequest } from './bootstrap-current-user.request.js';
import { BootstrapCurrentUserResponse } from './bootstrap-current-user.response.js';

function deriveNames(displayName: string | null, email: string): { readonly firstName: string; readonly lastName: string } {
  const source = displayName?.trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    const first = (parts[0] ?? 'User').slice(0, 120);
    const last = (parts.slice(1).join(' ') || 'CasePilot').slice(0, 120);
    return { firstName: first, lastName: last };
  }
  const localPart = (email.split('@')[0] ?? 'User').replaceAll(/[^a-zA-Z0-9._-]/g, ' ').trim();
  return { firstName: (localPart || 'User').slice(0, 120), lastName: 'CasePilot' };
}

export class BootstrapCurrentUserHandler implements Handler<BootstrapCurrentUserRequest, BootstrapCurrentUserResponse> {
  constructor(
    private readonly work: UnitOfWork<AuthScope>,
    private readonly runtime: CrudRuntime,
  ) {}

  async execute(request: BootstrapCurrentUserRequest): Promise<BootstrapCurrentUserResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      const { actor } = request;
      const existingIdentity = await scope.userIdentities.getByProviderSubject(actor.provider, actor.subject);
      if (existingIdentity) {
        const existingUser = await scope.users.getById(existingIdentity.userId, null);
        if (!existingUser || existingUser.status !== 'ACTIVE') {
          throw new ForbiddenError('User account is not active.');
        }
        const profile = await loadCurrentUserProfile(scope, existingUser);
        return new BootstrapCurrentUserResponse(profile, false);
      }

      const email = actor.email?.trim().toLowerCase() ?? '';
      if (!email) {
        throw new ValidationError('An authenticated email address is required to provision a CasePilot user.');
      }

      const now = this.runtime.now();
      const existingByEmail = await scope.users.getByEmail(email);
      if (existingByEmail) {
        if (existingByEmail.status !== 'ACTIVE') {
          throw new ForbiddenError('User account is not active.');
        }
        if (!actor.emailVerified) {
          throw new ForbiddenError('Email verification is required to link an existing CasePilot user.');
        }
        const link = new UserIdentity();
        link.id = this.runtime.newId();
        link.createdAt = now;
        link.updatedAt = now;
        link.version = 1;
        link.userId = existingByEmail.id;
        link.provider = actor.provider;
        link.subject = actor.subject;
        await scope.userIdentities.add(link);
        const profile = await loadCurrentUserProfile(scope, existingByEmail);
        return new BootstrapCurrentUserResponse(profile, false);
      }

      const names = deriveNames(actor.displayName, email);
      const user = new User();
      user.id = this.runtime.newId();
      user.createdAt = now;
      user.updatedAt = now;
      user.version = 1;
      user.email = email;
      user.emailVerifiedAt = actor.emailVerified ? now : null;
      user.firstName = names.firstName;
      user.lastName = names.lastName;
      user.displayName = actor.displayName;
      user.avatarUrl = null;
      user.locale = 'es';
      user.timezone = 'UTC';
      user.status = 'ACTIVE';
      user.lastLoginAt = now;
      const storedUser = await scope.users.add(user);

      const identity = new UserIdentity();
      identity.id = this.runtime.newId();
      identity.createdAt = now;
      identity.updatedAt = now;
      identity.version = 1;
      identity.userId = storedUser.id;
      identity.provider = actor.provider;
      identity.subject = actor.subject;
      await scope.userIdentities.add(identity);

      const account = new BusinessAccount();
      account.id = this.runtime.newId();
      account.createdAt = now;
      account.updatedAt = now;
      account.version = 1;
      account.name = `${names.firstName} Workspace`.slice(0, 255);
      account.legalName = null;
      account.slug = null;
      account.type = 'SOLO';
      account.taxId = null;
      account.email = email;
      account.phone = null;
      account.website = null;
      account.timezone = 'UTC';
      account.locale = 'es';
      account.currency = 'USD';
      account.countryCode = 'US';
      account.status = 'ACTIVE';
      account.settings = null;
      const storedAccount = await scope.businessAccounts.add(account);

      const member = new Member();
      member.id = this.runtime.newId();
      member.createdAt = now;
      member.updatedAt = now;
      member.version = 1;
      member.businessAccountId = storedAccount.id;
      member.userId = storedUser.id;
      member.role = 'OWNER';
      member.status = 'ACTIVE';
      member.title = null;
      member.professionalRegistration = null;
      member.hourlyRate = null;
      member.joinedAt = now;
      member.invitedAt = null;
      await scope.members.add(member);

      const profile = await loadCurrentUserProfile(scope, storedUser);
      return new BootstrapCurrentUserResponse(profile, true);
    }, 'SERIALIZABLE'));
  }
}
