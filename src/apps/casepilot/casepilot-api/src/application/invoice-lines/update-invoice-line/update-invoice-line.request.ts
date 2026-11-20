import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateInvoiceLineData {
  readonly invoiceId?: string;
  readonly caseId?: string | null;
  readonly description?: string;
  readonly quantity?: string;
  readonly unitPrice?: string;
  readonly taxRate?: string | null;
  readonly subtotal?: string;
  readonly total?: string;
  readonly sortOrder?: number;
}
export class UpdateInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateInvoiceLineData, public readonly actor: VerifiedIdentity) { super(); }
}
