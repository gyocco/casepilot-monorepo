import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateInvoiceLineData {
  readonly invoiceId: string;
  readonly caseId?: string | null;
  readonly description: string;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly taxRate?: string | null;
  readonly subtotal: string;
  readonly total: string;
  readonly sortOrder: number;
}
export class CreateInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateInvoiceLineData, public readonly actor: VerifiedIdentity) { super(); }
}
