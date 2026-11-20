import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export class BootstrapCurrentUserRequest extends Request {
  constructor(public readonly actor: VerifiedIdentity) {
    super();
  }
}
