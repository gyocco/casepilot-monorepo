import { Request, Response } from '@casepilot/cqrs';
import type { Payment } from '../../domain/entities/payment.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreatePaymentData {
  readonly invoiceId: string;
  readonly amount: string;
  readonly currency: string;
  readonly paymentMethod?: string | null;
  readonly reference?: string | null;
  readonly paidAt: string;
  readonly notes?: string | null;
}
export interface UpdatePaymentData {
  readonly invoiceId?: string;
  readonly amount?: string;
  readonly currency?: string;
  readonly paymentMethod?: string | null;
  readonly reference?: string | null;
  readonly paidAt?: string;
  readonly notes?: string | null;
}
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
export class CreatePaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreatePaymentData) { super(); }
}
export class CreatePaymentResponse extends Response {
  constructor(public readonly item: PaymentResponse) { super(); }
}
export class GetPaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetPaymentResponse extends Response {
  constructor(public readonly item: PaymentResponse) { super(); }
}
export class UpdatePaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdatePaymentData) { super(); }
}
export class UpdatePaymentResponse extends Response {
  constructor(public readonly item: PaymentResponse) { super(); }
}
export class DeletePaymentRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeletePaymentResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListPaymentsRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListPaymentsResponse extends Response {
  constructor(public readonly items: readonly PaymentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
