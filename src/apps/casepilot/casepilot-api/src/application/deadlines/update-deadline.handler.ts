import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Deadline } from '../../domain/entities/deadline.js';
import { UpdateDeadlineResponse, toDeadlineResponse, type UpdateDeadlineRequest } from './deadline.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { deadlineFields, validateDeadlineRelations } from './deadline.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateDeadlineHandler implements Handler<UpdateDeadlineRequest, UpdateDeadlineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Deadline>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateDeadlineRequest): Promise<UpdateDeadlineResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, deadlineFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Deadline();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.dueAt = request.data.dueAt !== undefined ? request.data.dueAt : existing.dueAt;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.responsibleMemberId = request.data.responsibleMemberId !== undefined ? request.data.responsibleMemberId : existing.responsibleMemberId;
      entity.completedAt = request.data.completedAt !== undefined ? request.data.completedAt : existing.completedAt;
      entity.notes = request.data.notes !== undefined ? request.data.notes : existing.notes;
      await validateDeadlineRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateDeadlineResponse(toDeadlineResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
