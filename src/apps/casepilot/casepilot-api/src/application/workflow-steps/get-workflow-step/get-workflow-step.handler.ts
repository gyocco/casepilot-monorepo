import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { WorkflowStep } from '../../../domain/entities/workflow-step.js';
import { GetWorkflowStepResponse } from './get-workflow-step.response.js';
import { toWorkflowStepResponse } from '../shared/workflow-step.response.js';
import { type GetWorkflowStepRequest } from './get-workflow-step.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetWorkflowStepHandler implements Handler<GetWorkflowStepRequest, GetWorkflowStepResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<WorkflowStep>>) {}

  async execute(request: GetWorkflowStepRequest): Promise<GetWorkflowStepResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetWorkflowStepResponse(toWorkflowStepResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
