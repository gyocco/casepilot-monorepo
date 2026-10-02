import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { TimeEntry } from '../../domain/entities/time-entry.js';
import { UpdateTimeEntryResponse, toTimeEntryResponse, type UpdateTimeEntryRequest } from './time-entry.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { time_entryFields, validateTimeEntryRelations } from './time-entry.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateTimeEntryHandler implements Handler<UpdateTimeEntryRequest, UpdateTimeEntryResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<TimeEntry>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateTimeEntryRequest): Promise<UpdateTimeEntryResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, time_entryFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new TimeEntry();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.memberId = request.data.memberId !== undefined ? request.data.memberId : existing.memberId;
      entity.taskId = request.data.taskId !== undefined ? request.data.taskId : existing.taskId;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.startedAt = request.data.startedAt !== undefined ? request.data.startedAt : existing.startedAt;
      entity.endedAt = request.data.endedAt !== undefined ? request.data.endedAt : existing.endedAt;
      entity.durationMinutes = request.data.durationMinutes !== undefined ? request.data.durationMinutes : existing.durationMinutes;
      entity.billable = request.data.billable !== undefined ? request.data.billable : existing.billable;
      entity.hourlyRate = request.data.hourlyRate !== undefined ? request.data.hourlyRate : existing.hourlyRate;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.invoiceLineId = request.data.invoiceLineId !== undefined ? request.data.invoiceLineId : existing.invoiceLineId;
      await validateTimeEntryRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateTimeEntryResponse(toTimeEntryResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
