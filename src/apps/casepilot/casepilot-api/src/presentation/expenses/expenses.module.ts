import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { Expense } from '../../domain/entities/expense.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmExpenseRepository } from '../../infrastructure/persistence/repositories/typeorm-expense.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateExpenseHandler } from '../../application/expenses/create-expense/create-expense.handler.js';
import { GetExpenseHandler } from '../../application/expenses/get-expense/get-expense.handler.js';
import { UpdateExpenseHandler } from '../../application/expenses/update-expense/update-expense.handler.js';
import { DeleteExpenseHandler } from '../../application/expenses/delete-expense/delete-expense.handler.js';
import { ListExpensesHandler } from '../../application/expenses/list-expenses/list-expenses.handler.js';
import { ExpensesController } from './expenses.controller.js';
const WORK = Symbol('Expenses_WORK');
@Module({
  controllers: [ExpensesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Expense>> =>
        new TypeOrmUnitOfWork<CrudScope<Expense>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmExpenseRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateExpenseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Expense>>): CreateExpenseHandler => new CreateExpenseHandler(work, systemCrudRuntime),
    },
    {
      provide: GetExpenseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Expense>>): GetExpenseHandler => new GetExpenseHandler(work),
    },
    {
      provide: UpdateExpenseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Expense>>): UpdateExpenseHandler => new UpdateExpenseHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteExpenseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Expense>>): DeleteExpenseHandler => new DeleteExpenseHandler(work),
    },
    {
      provide: ListExpensesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Expense>>): ListExpensesHandler => new ListExpensesHandler(work),
    },
  ],
})
export class ExpensesModule {}
