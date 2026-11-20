export interface UserAccountMembership {
  readonly memberId: string;
  readonly businessAccountId: string;
  readonly accountName: string;
  readonly accountStatus: string;
  readonly role: string;
  readonly memberStatus: string;
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly emailVerifiedAt: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string | null;
  readonly locale: string | null;
  readonly timezone: string | null;
  readonly status: string;
  readonly version: number;
  readonly memberships: readonly UserAccountMembership[];
}

export interface BootstrapProfileResponse {
  readonly profile: UserProfile;
  readonly provisioned: boolean;
}

export interface ProfileEnvelopeResponse {
  readonly profile: UserProfile;
}

export interface UpdateProfilePayload {
  readonly version: number;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
}

export interface BusinessAccountSummary {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly currency: string;
  readonly timezone: string;
  readonly version: number;
}

export interface BusinessAccountEnvelopeResponse {
  readonly item: BusinessAccountSummary;
}

export interface AuthorizationCheckResult {
  readonly allowed: boolean;
  readonly status: number;
  readonly message: string;
}
