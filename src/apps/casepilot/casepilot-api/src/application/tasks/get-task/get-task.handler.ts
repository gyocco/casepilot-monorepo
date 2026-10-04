import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Task } from '../../../domain/entities/task.js';
import { GetTaskResponse } from './get-task.response.js';
import { toTaskResponse } from '../shared/task.response.js';
import { type GetTaskRequest } from './get-task.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetTaskHandler implements Handler<GetTaskRequest, GetTaskResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Task>>) {}

  async execute(request: GetTaskRequest): Promise<GetTaskResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetTaskResponse(toTaskResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
