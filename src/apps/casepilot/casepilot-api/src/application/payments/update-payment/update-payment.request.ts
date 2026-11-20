import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdatePaymentData {
  readonly invoiceId?: string;
  readonly amount?: string;
  readonly currency?: string;
  readonly paymentMethod?: string | null;
  readonly reference?: string | null;
  readonly paidAt?: string;
  readonly notes?: string | null;
}
export class UpdatePaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdatePaymentData, public readonly actor: VerifiedIdentity) { super(); }
}
