import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Task } from '../../../domain/entities/task.js';
import { DeleteTaskResponse } from './delete-task.response.js';
import { type DeleteTaskRequest } from './delete-task.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteTaskHandler implements Handler<DeleteTaskRequest, DeleteTaskResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Task>>) {}

  async execute(request: DeleteTaskRequest): Promise<DeleteTaskResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteTaskResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
