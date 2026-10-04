import type { ExpenseResponse } from '../shared/expense.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListExpensesResponse extends Response {
  constructor(public readonly items: readonly ExpenseResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
