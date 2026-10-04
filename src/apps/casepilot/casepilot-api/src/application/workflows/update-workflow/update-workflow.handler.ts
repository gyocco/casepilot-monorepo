import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Workflow } from '../../../domain/entities/workflow.js';
import { UpdateWorkflowResponse } from './update-workflow.response.js';
import { toWorkflowResponse } from '../shared/workflow.response.js';
import { type UpdateWorkflowRequest } from './update-workflow.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { workflowFields, validateWorkflowRelations } from '../shared/workflow.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateWorkflowHandler implements Handler<UpdateWorkflowRequest, UpdateWorkflowResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateWorkflowRequest): Promise<UpdateWorkflowResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, workflowFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Workflow();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.isActive = request.data.isActive !== undefined ? request.data.isActive : existing.isActive;
      validateWorkflowRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateWorkflowResponse(toWorkflowResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
