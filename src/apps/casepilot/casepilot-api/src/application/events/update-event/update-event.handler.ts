import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Event } from '../../../domain/entities/event.js';
import { UpdateEventResponse } from './update-event.response.js';
import { toEventResponse } from '../shared/event.response.js';
import { type UpdateEventRequest } from './update-event.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { eventFields, validateEventRelations } from '../shared/event.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateEventHandler implements Handler<UpdateEventRequest, UpdateEventResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Event>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateEventRequest): Promise<UpdateEventResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, eventFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Event();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.eventType = request.data.eventType !== undefined ? request.data.eventType : existing.eventType;
      entity.startsAt = request.data.startsAt !== undefined ? request.data.startsAt : existing.startsAt;
      entity.endsAt = request.data.endsAt !== undefined ? request.data.endsAt : existing.endsAt;
      entity.allDay = request.data.allDay !== undefined ? request.data.allDay : existing.allDay;
      entity.location = request.data.location !== undefined ? request.data.location : existing.location;
      entity.createdByMemberId = request.data.createdByMemberId !== undefined ? request.data.createdByMemberId : existing.createdByMemberId;
      await validateEventRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateEventResponse(toEventResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
