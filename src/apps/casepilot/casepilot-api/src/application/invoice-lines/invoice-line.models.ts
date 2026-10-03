import { Request, Response } from '@casepilot/cqrs';
import type { InvoiceLine } from '../../domain/entities/invoice-line.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateInvoiceLineData {
  readonly invoiceId: string;
  readonly caseId?: string | null;
  readonly description: string;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly taxRate?: string | null;
  readonly subtotal: string;
  readonly total: string;
  readonly sortOrder: number;
}
export interface UpdateInvoiceLineData {
  readonly invoiceId?: string;
  readonly caseId?: string | null;
  readonly description?: string;
  readonly quantity?: string;
  readonly unitPrice?: string;
  readonly taxRate?: string | null;
  readonly subtotal?: string;
  readonly total?: string;
  readonly sortOrder?: number;
}
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
export class CreateInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateInvoiceLineData) { super(); }
}
export class CreateInvoiceLineResponse extends Response {
  constructor(public readonly item: InvoiceLineResponse) { super(); }
}
export class GetInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetInvoiceLineResponse extends Response {
  constructor(public readonly item: InvoiceLineResponse) { super(); }
}
export class UpdateInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateInvoiceLineData) { super(); }
}
export class UpdateInvoiceLineResponse extends Response {
  constructor(public readonly item: InvoiceLineResponse) { super(); }
}
export class DeleteInvoiceLineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteInvoiceLineResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListInvoiceLinesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListInvoiceLinesResponse extends Response {
  constructor(public readonly items: readonly InvoiceLineResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
