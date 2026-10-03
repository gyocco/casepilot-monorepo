import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { WorkflowStep } from '../../domain/entities/workflow-step.js';
import { GetWorkflowStepResponse, toWorkflowStepResponse, type GetWorkflowStepRequest } from './workflow-step.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetWorkflowStepHandler implements Handler<GetWorkflowStepRequest, GetWorkflowStepResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<WorkflowStep>>) {}

  async execute(request: GetWorkflowStepRequest): Promise<GetWorkflowStepResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetWorkflowStepResponse(toWorkflowStepResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
