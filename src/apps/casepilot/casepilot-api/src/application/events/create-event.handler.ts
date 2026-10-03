import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Event } from '../../domain/entities/event.js';
import { CreateEventResponse, toEventResponse, type CreateEventRequest } from './event.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { eventFields, validateEventRelations } from './event.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateEventHandler implements Handler<CreateEventRequest, CreateEventResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Event>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateEventRequest): Promise<CreateEventResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, eventFields, false);
      const entity = new Event();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.title = request.data.title;
      entity.description = request.data.description ?? null;
      entity.eventType = request.data.eventType ?? null;
      entity.startsAt = request.data.startsAt;
      entity.endsAt = request.data.endsAt ?? null;
      entity.allDay = request.data.allDay;
      entity.location = request.data.location ?? null;
      entity.createdByMemberId = request.data.createdByMemberId;
      await validateEventRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateEventResponse(toEventResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
