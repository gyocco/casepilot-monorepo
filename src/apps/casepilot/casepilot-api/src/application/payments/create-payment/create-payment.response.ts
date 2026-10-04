import type { PaymentResponse } from '../shared/payment.response.js';
import { Response } from '@casepilot/cqrs';

export class CreatePaymentResponse extends Response {
  constructor(public readonly item: PaymentResponse) { super(); }
}
