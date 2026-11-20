import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateTimeEntryData {
  readonly caseId?: string;
  readonly memberId?: string;
  readonly taskId?: string | null;
  readonly description?: string | null;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  readonly durationMinutes?: number;
  readonly billable?: boolean;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly invoiceLineId?: string | null;
}
export class UpdateTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateTimeEntryData, public readonly actor: VerifiedIdentity) { super(); }
}
