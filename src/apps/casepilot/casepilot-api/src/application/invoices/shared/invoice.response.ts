import { Response } from '@casepilot/cqrs';
import type { Invoice } from '../../../domain/entities/invoice.js';

export class InvoiceResponse extends Response {
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
  ) { super(); }
}
export function toInvoiceResponse(entity: Invoice): InvoiceResponse {
  return new InvoiceResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.externalPartyId, entity.caseId, entity.number, entity.status, entity.currency, entity.issueDate, entity.dueDate, entity.subtotal, entity.taxAmount, entity.total, entity.balanceDue, entity.notes);
}
