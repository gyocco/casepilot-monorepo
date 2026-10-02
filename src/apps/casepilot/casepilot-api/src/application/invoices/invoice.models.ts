import { Request, Response } from '@casepilot/cqrs';
import type { Invoice } from '../../domain/entities/invoice.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateInvoiceData {
  readonly externalPartyId: string;
  readonly caseId?: string | null;
  readonly number: string;
  readonly status: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE';
  readonly currency: string;
  readonly issueDate: string;
  readonly dueDate?: string | null;
  readonly subtotal: string;
  readonly taxAmount: string;
  readonly total: string;
  readonly balanceDue: string;
  readonly notes?: string | null;
}
export interface UpdateInvoiceData {
  readonly externalPartyId?: string;
  readonly caseId?: string | null;
  readonly number?: string;
  readonly status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'VOID' | 'OVERDUE';
  readonly currency?: string;
  readonly issueDate?: string;
  readonly dueDate?: string | null;
  readonly subtotal?: string;
  readonly taxAmount?: string;
  readonly total?: string;
  readonly balanceDue?: string;
  readonly notes?: string | null;
}
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
export class CreateInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateInvoiceData) { super(); }
}
export class CreateInvoiceResponse extends Response {
  constructor(public readonly item: InvoiceResponse) { super(); }
}
export class GetInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetInvoiceResponse extends Response {
  constructor(public readonly item: InvoiceResponse) { super(); }
}
export class UpdateInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateInvoiceData) { super(); }
}
export class UpdateInvoiceResponse extends Response {
  constructor(public readonly item: InvoiceResponse) { super(); }
}
export class DeleteInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteInvoiceResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListInvoicesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListInvoicesResponse extends Response {
  constructor(public readonly items: readonly InvoiceResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
