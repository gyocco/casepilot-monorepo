import { Request } from '@casepilot/cqrs';

export interface CreateUserData {
  readonly email: string;
  readonly emailVerifiedAt?: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
  readonly status: string;
  readonly lastLoginAt?: string | null;
}
export class CreateUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateUserData) { super(); }
}
