import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateUserData {
  readonly email?: string;
  readonly emailVerifiedAt?: string | null;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
  readonly status?: string;
  readonly lastLoginAt?: string | null;
}
export class UpdateUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateUserData, public readonly actor: VerifiedIdentity) { super(); }
}
