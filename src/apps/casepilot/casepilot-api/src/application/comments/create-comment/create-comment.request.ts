import { Request } from '@casepilot/cqrs';

export interface CreateCommentData {
  readonly authorMemberId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly body: string;
}
export class CreateCommentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCommentData) { super(); }
}
