import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Communication } from '../../../domain/entities/communication.js';
import { DeleteCommunicationResponse } from './delete-communication.response.js';
import { type DeleteCommunicationRequest } from './delete-communication.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class DeleteCommunicationHandler implements Handler<DeleteCommunicationRequest, DeleteCommunicationResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>) {}

  async execute(request: DeleteCommunicationRequest): Promise<DeleteCommunicationResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteCommunicationResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
