import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export class GetCommunicationRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly actor: VerifiedIdentity) { super(); }
}
