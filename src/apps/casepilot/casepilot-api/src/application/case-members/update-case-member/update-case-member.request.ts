import { Request } from '@casepilot/cqrs';

export interface UpdateCaseMemberData {
  readonly caseId?: string;
  readonly memberId?: string;
  readonly role?: string | null;
  readonly isPrimary?: boolean;
  readonly assignedAt?: string;
  readonly removedAt?: string | null;
}
export class UpdateCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseMemberData) { super(); }
}
