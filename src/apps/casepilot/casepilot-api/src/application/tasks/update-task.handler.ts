import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Task } from '../../domain/entities/task.js';
import { UpdateTaskResponse, toTaskResponse, type UpdateTaskRequest } from './task.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { taskFields, validateTaskRelations } from './task.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateTaskHandler implements Handler<UpdateTaskRequest, UpdateTaskResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Task>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateTaskRequest): Promise<UpdateTaskResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, taskFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Task();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.priority = request.data.priority !== undefined ? request.data.priority : existing.priority;
      entity.assignedMemberId = request.data.assignedMemberId !== undefined ? request.data.assignedMemberId : existing.assignedMemberId;
      entity.createdByMemberId = request.data.createdByMemberId !== undefined ? request.data.createdByMemberId : existing.createdByMemberId;
      entity.dueAt = request.data.dueAt !== undefined ? request.data.dueAt : existing.dueAt;
      entity.completedAt = request.data.completedAt !== undefined ? request.data.completedAt : existing.completedAt;
      await validateTaskRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateTaskResponse(toTaskResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
