import type { DataRepository } from './data.repository.js';
import type { Expense } from '../entities/expense.js';
export interface ExpenseRepository extends DataRepository<Expense> {
  readonly entityType?: Expense;
}
