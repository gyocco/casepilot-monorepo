import type { ExpenseResponse } from '../shared/expense.response.js';
import { Response } from '@casepilot/cqrs';

export class GetExpenseResponse extends Response {
  constructor(public readonly item: ExpenseResponse) { super(); }
}
