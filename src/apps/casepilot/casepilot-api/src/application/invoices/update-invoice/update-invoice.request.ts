import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateInvoiceData {
  readonly externalPartyId?: string;
  readonly caseId?: string | null;
  readonly number?: string;
  readonly status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE';
  readonly currency?: string;
  readonly issueDate?: string;
  readonly dueDate?: string | null;
  readonly subtotal?: string;
  readonly taxAmount?: string;
  readonly total?: string;
  readonly balanceDue?: string;
  readonly notes?: string | null;
}
export class UpdateInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateInvoiceData, public readonly actor: VerifiedIdentity) { super(); }
}
