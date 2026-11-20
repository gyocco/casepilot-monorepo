import type { Handler } from '@casepilot/cqrs';
import { ConflictError, NotFoundError, type UnitOfWork } from '@casepilot/abstractions';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import { DeleteBusinessAccountResponse } from './delete-business-account.response.js';
import { type DeleteBusinessAccountRequest } from './delete-business-account.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { authorizeBusinessAccountAction } from '../../shared/authorization.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';

export class DeleteBusinessAccountHandler implements Handler<DeleteBusinessAccountRequest, DeleteBusinessAccountResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>) {}

  async execute(request: DeleteBusinessAccountRequest): Promise<DeleteBusinessAccountResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      await authorizeBusinessAccountAction(scope, request.actor, 'admin', request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteBusinessAccountResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
