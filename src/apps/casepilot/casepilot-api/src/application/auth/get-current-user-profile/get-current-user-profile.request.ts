import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export class GetCurrentUserProfileRequest extends Request {
  constructor(public readonly actor: VerifiedIdentity) {
    super();
  }
}
