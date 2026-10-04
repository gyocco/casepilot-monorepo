import { Request } from '@casepilot/cqrs';

export interface CreateInvoiceData {
  readonly externalPartyId: string;
  readonly caseId?: string | null;
  readonly number: string;
  readonly status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE';
  readonly currency: string;
  readonly issueDate: string;
  readonly dueDate?: string | null;
  readonly subtotal: string;
  readonly taxAmount: string;
  readonly total: string;
  readonly balanceDue: string;
  readonly notes?: string | null;
}
export class CreateInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateInvoiceData) { super(); }
}
