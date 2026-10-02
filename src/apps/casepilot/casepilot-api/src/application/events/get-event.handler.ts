import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Event } from '../../domain/entities/event.js';
import { GetEventResponse, toEventResponse, type GetEventRequest } from './event.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetEventHandler implements Handler<GetEventRequest, GetEventResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Event>>) {}

  async execute(request: GetEventRequest): Promise<GetEventResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetEventResponse(toEventResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
