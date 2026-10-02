import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Workflow } from '../../domain/entities/workflow.js';
import { DeleteWorkflowResponse, type DeleteWorkflowRequest } from './workflow.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class DeleteWorkflowHandler implements Handler<DeleteWorkflowRequest, DeleteWorkflowResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>) {}

  async execute(request: DeleteWorkflowRequest): Promise<DeleteWorkflowResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteWorkflowResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
