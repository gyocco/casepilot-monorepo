import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateCommentData {
  readonly authorMemberId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly body: string;
}
export class CreateCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCommentData, public readonly actor: VerifiedIdentity) { super(); }
}
