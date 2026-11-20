import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { WorkflowStep } from '../../../domain/entities/workflow-step.js';
import { CreateWorkflowStepResponse } from './create-workflow-step.response.js';
import { toWorkflowStepResponse } from '../shared/workflow-step.response.js';
import { type CreateWorkflowStepRequest } from './create-workflow-step.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { workflow_stepFields, validateWorkflowStepRelations } from '../shared/workflow-step.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateWorkflowStepHandler implements Handler<CreateWorkflowStepRequest, CreateWorkflowStepResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<WorkflowStep>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateWorkflowStepRequest): Promise<CreateWorkflowStepResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, workflow_stepFields, false);
      const entity = new WorkflowStep();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.workflowId = request.data.workflowId;
      entity.statusDefinitionId = request.data.statusDefinitionId ?? null;
      entity.name = request.data.name;
      entity.description = request.data.description ?? null;
      entity.sortOrder = request.data.sortOrder;
      entity.isInitial = request.data.isInitial;
      entity.isTerminal = request.data.isTerminal;
      await validateWorkflowStepRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateWorkflowStepResponse(toWorkflowStepResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
