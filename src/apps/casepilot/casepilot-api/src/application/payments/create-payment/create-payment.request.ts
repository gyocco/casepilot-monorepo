import { Request } from '@casepilot/cqrs';

export interface CreatePaymentData {
  readonly invoiceId: string;
  readonly amount: string;
  readonly currency: string;
  readonly paymentMethod?: string | null;
  readonly reference?: string | null;
  readonly paidAt: string;
  readonly notes?: string | null;
}
export class CreatePaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreatePaymentData) { super(); }
}
