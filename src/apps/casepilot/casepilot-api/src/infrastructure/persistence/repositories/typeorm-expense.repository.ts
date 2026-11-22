import type { EntityManager } from 'typeorm';
import type { Expense } from '../../../domain/entities/expense.js';
import type { ExpenseRepository } from '../../../domain/repositories/expense.repository.js';
import { expenseTable } from '../schemas/expense.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmExpenseRepository extends TypeOrmDataRepository<Expense> implements ExpenseRepository {
  constructor(manager: EntityManager) { super(manager, expenseTable); }
}
