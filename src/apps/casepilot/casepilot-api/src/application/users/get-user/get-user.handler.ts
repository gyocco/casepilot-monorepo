import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { User } from '../../../domain/entities/user.js';
import { GetUserResponse } from './get-user.response.js';
import { toUserResponse } from '../shared/user.response.js';
import { type GetUserRequest } from './get-user.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetUserHandler implements Handler<GetUserRequest, GetUserResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetUserResponse(toUserResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
