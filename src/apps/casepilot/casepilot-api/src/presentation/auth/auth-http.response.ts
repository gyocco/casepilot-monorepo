import type { CurrentUserProfileResponse, UserAccountMembershipResponse } from '../../application/auth/shared/current-user-profile.response.js';

export class UserAccountMembershipHttpResponse {
  constructor(
    public readonly memberId: string,
    public readonly businessAccountId: string,
    public readonly accountName: string,
    public readonly accountStatus: string,
    public readonly role: string,
    public readonly memberStatus: string,
  ) {}
}

export class CurrentUserProfileHttpResponse {
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
    public readonly memberships: readonly UserAccountMembershipHttpResponse[],
  ) {}
}

export class ProfileEnvelopeHttpResponse {
  constructor(public readonly profile: CurrentUserProfileHttpResponse) {}
}

export class BootstrapProfileHttpResponse {
  constructor(
    public readonly profile: CurrentUserProfileHttpResponse,
    public readonly provisioned: boolean,
  ) {}
}

function toMembershipHttpResponse(item: UserAccountMembershipResponse): UserAccountMembershipHttpResponse {
  return new UserAccountMembershipHttpResponse(
    item.memberId,
    item.businessAccountId,
    item.accountName,
    item.accountStatus,
    item.role,
    item.memberStatus,
  );
}

export function toCurrentUserProfileHttpResponse(profile: CurrentUserProfileResponse): CurrentUserProfileHttpResponse {
  return new CurrentUserProfileHttpResponse(
    profile.id,
    profile.email,
    profile.emailVerifiedAt,
    profile.firstName,
    profile.lastName,
    profile.displayName,
    profile.locale,
    profile.timezone,
    profile.status,
    profile.version,
    profile.memberships.map(toMembershipHttpResponse),
  );
}
