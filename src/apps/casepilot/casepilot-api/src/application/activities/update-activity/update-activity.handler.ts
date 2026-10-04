import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Activity } from '../../../domain/entities/activity.js';
import { UpdateActivityResponse } from './update-activity.response.js';
import { toActivityResponse } from '../shared/activity.response.js';
import { type UpdateActivityRequest } from './update-activity.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { activityFields, validateActivityRelations } from '../shared/activity.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateActivityHandler implements Handler<UpdateActivityRequest, UpdateActivityResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Activity>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateActivityRequest): Promise<UpdateActivityResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, activityFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Activity();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.actorMemberId = request.data.actorMemberId !== undefined ? request.data.actorMemberId : existing.actorMemberId;
      entity.action = request.data.action !== undefined ? request.data.action : existing.action;
      entity.entityType = request.data.entityType !== undefined ? request.data.entityType : existing.entityType;
      entity.entityId = request.data.entityId !== undefined ? request.data.entityId : existing.entityId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.metadata = request.data.metadata !== undefined ? request.data.metadata : existing.metadata;
      entity.occurredAt = request.data.occurredAt !== undefined ? request.data.occurredAt : existing.occurredAt;
      await validateActivityRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateActivityResponse(toActivityResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
