import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { WorkflowStep } from '../../domain/entities/workflow-step.js';
import { UpdateWorkflowStepResponse, toWorkflowStepResponse, type UpdateWorkflowStepRequest } from './workflow-step.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { workflow_stepFields, validateWorkflowStepRelations } from './workflow-step.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateWorkflowStepHandler implements Handler<UpdateWorkflowStepRequest, UpdateWorkflowStepResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<WorkflowStep>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateWorkflowStepRequest): Promise<UpdateWorkflowStepResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, workflow_stepFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new WorkflowStep();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.workflowId = request.data.workflowId !== undefined ? request.data.workflowId : existing.workflowId;
      entity.statusDefinitionId = request.data.statusDefinitionId !== undefined ? request.data.statusDefinitionId : existing.statusDefinitionId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.sortOrder = request.data.sortOrder !== undefined ? request.data.sortOrder : existing.sortOrder;
      entity.isInitial = request.data.isInitial !== undefined ? request.data.isInitial : existing.isInitial;
      entity.isTerminal = request.data.isTerminal !== undefined ? request.data.isTerminal : existing.isTerminal;
      await validateWorkflowStepRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateWorkflowStepResponse(toWorkflowStepResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
