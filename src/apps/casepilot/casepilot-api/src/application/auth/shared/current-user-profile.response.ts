import { Response } from '@casepilot/cqrs';
import type { FieldRule } from '@casepilot/validation';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { Member } from '../../../domain/entities/member.js';
import type { User } from '../../../domain/entities/user.js';
import type { BusinessAccountRepository } from '../../../domain/repositories/business-account.repository.js';
import type { AuthorizationScope } from '../../shared/crud-models.js';

export interface AuthScope extends AuthorizationScope {
  readonly businessAccounts: BusinessAccountRepository;
}

export class UserAccountMembershipResponse extends Response {
  constructor(
    public readonly memberId: string,
    public readonly businessAccountId: string,
    public readonly accountName: string,
    public readonly accountStatus: string,
    public readonly role: string,
    public readonly memberStatus: string,
  ) {
    super();
  }
}

export class CurrentUserProfileResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly emailVerifiedAt: string | null,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly displayName: string | null,
    public readonly locale: string | null,
    public readonly timezone: string | null,
    public readonly status: string,
    public readonly version: number,
    public readonly memberships: readonly UserAccountMembershipResponse[],
  ) {
    super();
  }
}

export const currentUserProfileUpdateFields: readonly FieldRule[] = [
  { name: 'firstName', kind: 'string', nullable: false, nonblank: true, maxLength: 255 },
  { name: 'lastName', kind: 'string', nullable: false, nonblank: true, maxLength: 255 },
  { name: 'displayName', kind: 'string', nullable: true, nonblank: true, maxLength: 255 },
  { name: 'locale', kind: 'string', nullable: true, nonblank: true, maxLength: 64 },
  { name: 'timezone', kind: 'string', nullable: true, nonblank: true, maxLength: 64 },
];

export async function loadCurrentUserProfile(scope: AuthScope, user: User): Promise<CurrentUserProfileResponse> {
  const members: readonly Member[] = await scope.members.listByUser(user.id);
  const activeMembers = members.filter(member => member.status === 'ACTIVE');
  const accountIds = [...new Set(activeMembers.map(member => member.businessAccountId))];
  const accounts: readonly BusinessAccount[] = await scope.businessAccounts.listByIds(accountIds);
  const accountsById = new Map(accounts.map(account => [account.id, account]));
  const memberships = activeMembers
    .map(member => {
      const account = accountsById.get(member.businessAccountId);
      if (!account) return null;
      return new UserAccountMembershipResponse(
        member.id,
        account.id,
        account.name,
        account.status,
        member.role,
        member.status,
      );
    })
    .filter((item): item is UserAccountMembershipResponse => item !== null);
  return new CurrentUserProfileResponse(
    user.id,
    user.email,
    user.emailVerifiedAt,
    user.firstName,
    user.lastName,
    user.displayName,
    user.locale,
    user.timezone,
    user.status,
    user.version,
    memberships,
  );
}
