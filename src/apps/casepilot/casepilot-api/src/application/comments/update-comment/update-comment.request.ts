import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateCommentData {
  readonly authorMemberId?: string;
  readonly targetType?: string;
  readonly targetId?: string;
  readonly body?: string;
}
export class UpdateCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCommentData, public readonly actor: VerifiedIdentity) { super(); }
}
