import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Deadline } from '../../../domain/entities/deadline.js';
import { GetDeadlineResponse } from './get-deadline.response.js';
import { toDeadlineResponse } from '../shared/deadline.response.js';
import { type GetDeadlineRequest } from './get-deadline.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetDeadlineHandler implements Handler<GetDeadlineRequest, GetDeadlineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Deadline>>) {}

  async execute(request: GetDeadlineRequest): Promise<GetDeadlineResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetDeadlineResponse(toDeadlineResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
