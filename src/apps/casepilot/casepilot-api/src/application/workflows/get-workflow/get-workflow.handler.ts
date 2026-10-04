import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Workflow } from '../../../domain/entities/workflow.js';
import { GetWorkflowResponse } from './get-workflow.response.js';
import { toWorkflowResponse } from '../shared/workflow.response.js';
import { type GetWorkflowRequest } from './get-workflow.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetWorkflowHandler implements Handler<GetWorkflowRequest, GetWorkflowResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>) {}

  async execute(request: GetWorkflowRequest): Promise<GetWorkflowResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetWorkflowResponse(toWorkflowResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
