import type { InvoiceLineResponse } from '../../application/invoice-lines/invoice-line.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class InvoiceLineHttpResponse {
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
  ) {}
}
export function toInvoiceLineHttpResponse(item: InvoiceLineResponse): InvoiceLineHttpResponse {
  return new InvoiceLineHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.invoiceId, item.caseId, item.description, item.quantity, item.unitPrice, item.taxRate, item.subtotal, item.total, item.sortOrder);
}
export class InvoiceLineItemHttpResponse {
  constructor(public readonly item: InvoiceLineHttpResponse) {}
}
export class InvoiceLinesPageHttpResponse {
  constructor(public readonly items: readonly InvoiceLineHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteInvoiceLineHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
