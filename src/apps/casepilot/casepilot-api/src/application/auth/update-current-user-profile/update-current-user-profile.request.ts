import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateCurrentUserProfileData {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
}

export class UpdateCurrentUserProfileRequest extends Request {
  constructor(
    public readonly actor: VerifiedIdentity,
    public readonly version: number,
    public readonly data: UpdateCurrentUserProfileData,
  ) {
    super();
  }
}
