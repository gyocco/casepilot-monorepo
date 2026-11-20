import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateCaseMemberData {
  readonly caseId: string;
  readonly memberId: string;
  readonly role?: string | null;
  readonly isPrimary: boolean;
  readonly assignedAt: string;
  readonly removedAt?: string | null;
}
export class CreateCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseMemberData, public readonly actor: VerifiedIdentity) { super(); }
}
