import { Response } from '@casepilot/cqrs';
import type { Expense } from '../../../domain/entities/expense.js';

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
