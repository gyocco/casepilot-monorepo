import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Expense } from '../../../domain/entities/expense.js';
import { GetExpenseResponse } from './get-expense.response.js';
import { toExpenseResponse } from '../shared/expense.response.js';
import { type GetExpenseRequest } from './get-expense.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetExpenseHandler implements Handler<GetExpenseRequest, GetExpenseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Expense>>) {}

  async execute(request: GetExpenseRequest): Promise<GetExpenseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetExpenseResponse(toExpenseResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
