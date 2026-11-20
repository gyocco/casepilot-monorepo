import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateTaskData {
  readonly caseId?: string | null;
  readonly title: string;
  readonly description?: string | null;
  readonly status: string;
  readonly priority?: string | null;
  readonly assignedMemberId?: string | null;
  readonly createdByMemberId: string;
  readonly dueAt?: string | null;
  readonly completedAt?: string | null;
}
export class CreateTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateTaskData, public readonly actor: VerifiedIdentity) { super(); }
}
