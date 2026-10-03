import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { TimeEntry } from '../../domain/entities/time-entry.js';
import { CreateTimeEntryResponse, toTimeEntryResponse, type CreateTimeEntryRequest } from './time-entry.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { time_entryFields, validateTimeEntryRelations } from './time-entry.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateTimeEntryHandler implements Handler<CreateTimeEntryRequest, CreateTimeEntryResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<TimeEntry>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateTimeEntryRequest): Promise<CreateTimeEntryResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, time_entryFields, false);
      const entity = new TimeEntry();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId;
      entity.memberId = request.data.memberId;
      entity.taskId = request.data.taskId ?? null;
      entity.description = request.data.description ?? null;
      entity.startedAt = request.data.startedAt ?? null;
      entity.endedAt = request.data.endedAt ?? null;
      entity.durationMinutes = request.data.durationMinutes;
      entity.billable = request.data.billable;
      entity.hourlyRate = request.data.hourlyRate ?? null;
      entity.currency = request.data.currency ?? null;
      entity.invoiceLineId = request.data.invoiceLineId ?? null;
      await validateTimeEntryRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateTimeEntryResponse(toTimeEntryResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
