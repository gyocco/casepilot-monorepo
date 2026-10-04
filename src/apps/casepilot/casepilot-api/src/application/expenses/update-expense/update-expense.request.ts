import { Request } from '@casepilot/cqrs';

export interface UpdateExpenseData {
  readonly caseId?: string;
  readonly memberId?: string | null;
  readonly description?: string;
  readonly amount?: string;
  readonly currency?: string;
  readonly occurredOn?: string;
  readonly billable?: boolean;
  readonly invoiceLineId?: string | null;
  readonly documentId?: string | null;
}
export class UpdateExpenseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateExpenseData) { super(); }
}
