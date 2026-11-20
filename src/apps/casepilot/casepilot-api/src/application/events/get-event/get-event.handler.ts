import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Event } from '../../../domain/entities/event.js';
import { GetEventResponse } from './get-event.response.js';
import { toEventResponse } from '../shared/event.response.js';
import { type GetEventRequest } from './get-event.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetEventHandler implements Handler<GetEventRequest, GetEventResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Event>>) {}

  async execute(request: GetEventRequest): Promise<GetEventResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetEventResponse(toEventResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
