import { Response } from '@casepilot/cqrs';
import type { Payment } from '../../../domain/entities/payment.js';

export class PaymentResponse extends Response {
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
  ) { super(); }
}
export function toPaymentResponse(entity: Payment): PaymentResponse {
  return new PaymentResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.invoiceId, entity.amount, entity.currency, entity.paymentMethod, entity.reference, entity.paidAt, entity.notes);
}
