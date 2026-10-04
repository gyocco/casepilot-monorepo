import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Task } from '../../../domain/entities/task.js';
import { CreateTaskResponse } from './create-task.response.js';
import { toTaskResponse } from '../shared/task.response.js';
import { type CreateTaskRequest } from './create-task.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { taskFields, validateTaskRelations } from '../shared/task.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateTaskHandler implements Handler<CreateTaskRequest, CreateTaskResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Task>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateTaskRequest): Promise<CreateTaskResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, taskFields, false);
      const entity = new Task();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.title = request.data.title;
      entity.description = request.data.description ?? null;
      entity.status = request.data.status;
      entity.priority = request.data.priority ?? null;
      entity.assignedMemberId = request.data.assignedMemberId ?? null;
      entity.createdByMemberId = request.data.createdByMemberId;
      entity.dueAt = request.data.dueAt ?? null;
      entity.completedAt = request.data.completedAt ?? null;
      await validateTaskRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateTaskResponse(toTaskResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
