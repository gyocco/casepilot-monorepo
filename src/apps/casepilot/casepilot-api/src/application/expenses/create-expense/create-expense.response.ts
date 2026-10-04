import type { ExpenseResponse } from '../shared/expense.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateExpenseResponse extends Response {
  constructor(public readonly item: ExpenseResponse) { super(); }
}
