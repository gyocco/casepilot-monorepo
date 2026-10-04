import { Response } from '@casepilot/cqrs';
import type { InvoiceLine } from '../../../domain/entities/invoice-line.js';

export class InvoiceLineResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly invoiceId: string,
    public readonly caseId: string | null,
    public readonly description: string,
    public readonly quantity: string,
    public readonly unitPrice: string,
    public readonly taxRate: string | null,
    public readonly subtotal: string,
    public readonly total: string,
    public readonly sortOrder: number,
  ) { super(); }
}
export function toInvoiceLineResponse(entity: InvoiceLine): InvoiceLineResponse {
  return new InvoiceLineResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.invoiceId, entity.caseId, entity.description, entity.quantity, entity.unitPrice, entity.taxRate, entity.subtotal, entity.total, entity.sortOrder);
}
