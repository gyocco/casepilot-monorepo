import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Workflow } from '../../domain/entities/workflow.js';
import { GetWorkflowResponse, toWorkflowResponse, type GetWorkflowRequest } from './workflow.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetWorkflowHandler implements Handler<GetWorkflowRequest, GetWorkflowResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>) {}

  async execute(request: GetWorkflowRequest): Promise<GetWorkflowResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetWorkflowResponse(toWorkflowResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
