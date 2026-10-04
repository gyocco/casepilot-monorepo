import { Request } from '@casepilot/cqrs';

export interface CreateTimeEntryData {
  readonly caseId: string;
  readonly memberId: string;
  readonly taskId?: string | null;
  readonly description?: string | null;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  readonly durationMinutes: number;
  readonly billable: boolean;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly invoiceLineId?: string | null;
}
export class CreateTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateTimeEntryData) { super(); }
}
