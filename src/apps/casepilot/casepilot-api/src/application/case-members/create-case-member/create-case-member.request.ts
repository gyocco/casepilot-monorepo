import { Request } from '@casepilot/cqrs';

export interface CreateCaseMemberData {
  readonly caseId: string;
  readonly memberId: string;
  readonly role?: string | null;
  readonly isPrimary: boolean;
  readonly assignedAt: string;
  readonly removedAt?: string | null;
}
export class CreateCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseMemberData) { super(); }
}
