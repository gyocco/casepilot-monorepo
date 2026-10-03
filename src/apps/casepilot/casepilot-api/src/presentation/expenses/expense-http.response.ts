import type { ExpenseResponse } from '../../application/expenses/expense.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class ExpenseHttpResponse {
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
  ) {}
}
export function toExpenseHttpResponse(item: ExpenseResponse): ExpenseHttpResponse {
  return new ExpenseHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.memberId, item.description, item.amount, item.currency, item.occurredOn, item.billable, item.invoiceLineId, item.documentId);
}
export class ExpenseItemHttpResponse {
  constructor(public readonly item: ExpenseHttpResponse) {}
}
export class ExpensesPageHttpResponse {
  constructor(public readonly items: readonly ExpenseHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteExpenseHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
