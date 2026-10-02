import { Request, Response } from '@casepilot/cqrs';
import type { Expense } from '../../domain/entities/expense.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateExpenseData {
  readonly caseId: string;
  readonly memberId?: string | null;
  readonly description: string;
  readonly amount: string;
  readonly currency: string;
  readonly occurredOn: string;
  readonly billable: boolean;
  readonly invoiceLineId?: string | null;
  readonly documentId?: string | null;
}
export interface UpdateExpenseData {
  readonly caseId?: string;
  readonly memberId?: string | null;
  readonly description?: string;
  readonly amount?: string;
  readonly currency?: string;
  readonly occurredOn?: string;
  readonly billable?: boolean;
  readonly invoiceLineId?: string | null;
  readonly documentId?: string | null;
}
export class ExpenseResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly memberId: string | null,
    public readonly description: string,
    public readonly amount: string,
    public readonly currency: string,
    public readonly occurredOn: string,
    public readonly billable: boolean,
    public readonly invoiceLineId: string | null,
    public readonly documentId: string | null,
  ) { super(); }
}
export function toExpenseResponse(entity: Expense): ExpenseResponse {
  return new ExpenseResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.memberId, entity.description, entity.amount, entity.currency, entity.occurredOn, entity.billable, entity.invoiceLineId, entity.documentId);
}
export class CreateExpenseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateExpenseData) { super(); }
}
export class CreateExpenseResponse extends Response {
  constructor(public readonly item: ExpenseResponse) { super(); }
}
export class GetExpenseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetExpenseResponse extends Response {
  constructor(public readonly item: ExpenseResponse) { super(); }
}
export class UpdateExpenseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateExpenseData) { super(); }
}
export class UpdateExpenseResponse extends Response {
  constructor(public readonly item: ExpenseResponse) { super(); }
}
export class DeleteExpenseRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteExpenseResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListExpensesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListExpensesResponse extends Response {
  constructor(public readonly items: readonly ExpenseResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
