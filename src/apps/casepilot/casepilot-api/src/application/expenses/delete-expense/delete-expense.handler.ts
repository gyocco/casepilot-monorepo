import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Expense } from '../../../domain/entities/expense.js';
import { DeleteExpenseResponse } from './delete-expense.response.js';
import { type DeleteExpenseRequest } from './delete-expense.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteExpenseHandler implements Handler<DeleteExpenseRequest, DeleteExpenseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Expense>>) {}

  async execute(request: DeleteExpenseRequest): Promise<DeleteExpenseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteExpenseResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
