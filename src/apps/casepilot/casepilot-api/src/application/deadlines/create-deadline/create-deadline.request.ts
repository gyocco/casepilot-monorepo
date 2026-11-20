import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateDeadlineData {
  readonly caseId: string;
  readonly title: string;
  readonly dueAt: string;
  readonly status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  readonly responsibleMemberId?: string | null;
  readonly completedAt?: string | null;
  readonly notes?: string | null;
}
export class CreateDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDeadlineData, public readonly actor: VerifiedIdentity) { super(); }
}
