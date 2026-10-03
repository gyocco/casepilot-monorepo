import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Expense } from '../entities/expense.js';
export interface ExpenseRepository extends DataRepository<Expense> {
  readonly entityType?: Expense;
}
