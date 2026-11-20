import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export class DeleteDocumentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly actor: VerifiedIdentity) { super(); }
}
