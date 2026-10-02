import type { PaymentResponse } from '../../application/payments/payment.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class PaymentHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly invoiceId: string,
    public readonly amount: string,
    public readonly currency: string,
    public readonly paymentMethod: string | null,
    public readonly reference: string | null,
    public readonly paidAt: string,
    public readonly notes: string | null,
  ) {}
}
export function toPaymentHttpResponse(item: PaymentResponse): PaymentHttpResponse {
  return new PaymentHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.invoiceId, item.amount, item.currency, item.paymentMethod, item.reference, item.paidAt, item.notes);
}
export class PaymentItemHttpResponse {
  constructor(public readonly item: PaymentHttpResponse) {}
}
export class PaymentsPageHttpResponse {
  constructor(public readonly items: readonly PaymentHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeletePaymentHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
