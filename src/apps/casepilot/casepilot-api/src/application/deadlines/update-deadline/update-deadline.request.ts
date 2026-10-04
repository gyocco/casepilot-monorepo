import { Request } from '@casepilot/cqrs';

export interface UpdateDeadlineData {
  readonly caseId?: string;
  readonly title?: string;
  readonly dueAt?: string;
  readonly status?: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  readonly responsibleMemberId?: string | null;
  readonly completedAt?: string | null;
  readonly notes?: string | null;
}
export class UpdateDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDeadlineData) { super(); }
}
