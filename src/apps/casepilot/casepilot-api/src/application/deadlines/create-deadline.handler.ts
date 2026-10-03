import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Deadline } from '../../domain/entities/deadline.js';
import { CreateDeadlineResponse, toDeadlineResponse, type CreateDeadlineRequest } from './deadline.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { deadlineFields, validateDeadlineRelations } from './deadline.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateDeadlineHandler implements Handler<CreateDeadlineRequest, CreateDeadlineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Deadline>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateDeadlineRequest): Promise<CreateDeadlineResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, deadlineFields, false);
      const entity = new Deadline();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId;
      entity.title = request.data.title;
      entity.dueAt = request.data.dueAt;
      entity.status = request.data.status;
      entity.responsibleMemberId = request.data.responsibleMemberId ?? null;
      entity.completedAt = request.data.completedAt ?? null;
      entity.notes = request.data.notes ?? null;
      await validateDeadlineRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateDeadlineResponse(toDeadlineResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
