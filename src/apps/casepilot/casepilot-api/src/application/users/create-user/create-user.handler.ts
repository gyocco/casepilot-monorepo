import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork } from '@casepilot/abstractions';
import { User } from '../../../domain/entities/user.js';
import { CreateUserResponse } from './create-user.response.js';
import { toUserResponse } from '../shared/user.response.js';
import { type CreateUserRequest } from './create-user.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeUserAction } from '../../shared/authorization.js';
import { userFields, validateUserRelations } from '../shared/user.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateUserHandler implements Handler<CreateUserRequest, CreateUserResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      await authorizeUserAction(scope, request.actor, 'create');
      validateFields(request.data, userFields, false);
      const entity = new User();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.email = request.data.email;
      entity.emailVerifiedAt = request.data.emailVerifiedAt ?? null;
      entity.firstName = request.data.firstName;
      entity.lastName = request.data.lastName;
      entity.displayName = request.data.displayName ?? null;
      entity.avatarUrl = request.data.avatarUrl ?? null;
      entity.locale = request.data.locale ?? null;
      entity.timezone = request.data.timezone ?? null;
      entity.status = request.data.status;
      entity.lastLoginAt = request.data.lastLoginAt ?? null;
      entity.email = entity.email.trim().toLowerCase();
      validateUserRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateUserResponse(toUserResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
