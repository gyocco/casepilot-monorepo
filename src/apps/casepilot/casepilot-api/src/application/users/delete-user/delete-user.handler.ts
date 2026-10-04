import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { User } from '../../../domain/entities/user.js';
import { DeleteUserResponse } from './delete-user.response.js';
import { type DeleteUserRequest } from './delete-user.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteUserHandler implements Handler<DeleteUserRequest, DeleteUserResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>) {}

  async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteUserResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
