import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateTaskData {
  readonly caseId?: string | null;
  readonly title?: string;
  readonly description?: string | null;
  readonly status?: string;
  readonly priority?: string | null;
  readonly assignedMemberId?: string | null;
  readonly createdByMemberId?: string;
  readonly dueAt?: string | null;
  readonly completedAt?: string | null;
}
export class UpdateTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateTaskData, public readonly actor: VerifiedIdentity) { super(); }
}
