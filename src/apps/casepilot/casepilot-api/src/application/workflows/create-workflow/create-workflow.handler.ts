import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Workflow } from '../../../domain/entities/workflow.js';
import { CreateWorkflowResponse } from './create-workflow.response.js';
import { toWorkflowResponse } from '../shared/workflow.response.js';
import { type CreateWorkflowRequest } from './create-workflow.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { workflowFields, validateWorkflowRelations } from '../shared/workflow.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateWorkflowHandler implements Handler<CreateWorkflowRequest, CreateWorkflowResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateWorkflowRequest): Promise<CreateWorkflowResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, workflowFields, false);
      const entity = new Workflow();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.name = request.data.name;
      entity.description = request.data.description ?? null;
      entity.isActive = request.data.isActive;
      validateWorkflowRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateWorkflowResponse(toWorkflowResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
