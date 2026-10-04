import type { InvoiceResponse } from '../../application/invoices/shared/invoice.response.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class InvoiceHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly externalPartyId: string,
    public readonly caseId: string | null,
    public readonly number: string,
    public readonly status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE',
    public readonly currency: string,
    public readonly issueDate: string,
    public readonly dueDate: string | null,
    public readonly subtotal: string,
    public readonly taxAmount: string,
    public readonly total: string,
    public readonly balanceDue: string,
    public readonly notes: string | null,
  ) {}
}
export function toInvoiceHttpResponse(item: InvoiceResponse): InvoiceHttpResponse {
  return new InvoiceHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.externalPartyId, item.caseId, item.number, item.status, item.currency, item.issueDate, item.dueDate, item.subtotal, item.taxAmount, item.total, item.balanceDue, item.notes);
}
export class InvoiceItemHttpResponse {
  constructor(public readonly item: InvoiceHttpResponse) {}
}
export class InvoicesPageHttpResponse {
  constructor(public readonly items: readonly InvoiceHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteInvoiceHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
