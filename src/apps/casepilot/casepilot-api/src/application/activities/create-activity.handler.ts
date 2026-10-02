import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Activity } from '../../domain/entities/activity.js';
import { CreateActivityResponse, toActivityResponse, type CreateActivityRequest } from './activity.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { activityFields, validateActivityRelations } from './activity.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateActivityHandler implements Handler<CreateActivityRequest, CreateActivityResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Activity>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateActivityRequest): Promise<CreateActivityResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, activityFields, false);
      const entity = new Activity();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.actorMemberId = request.data.actorMemberId ?? null;
      entity.action = request.data.action;
      entity.entityType = request.data.entityType;
      entity.entityId = request.data.entityId;
      entity.caseId = request.data.caseId ?? null;
      entity.metadata = request.data.metadata ?? null;
      entity.occurredAt = request.data.occurredAt;
      await validateActivityRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateActivityResponse(toActivityResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
