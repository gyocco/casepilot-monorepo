import type { PaymentResponse } from '../shared/payment.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListPaymentsResponse extends Response {
  constructor(public readonly items: readonly PaymentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
