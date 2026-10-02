import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork } from '@casepilot/abstractions';
import { User } from '../../domain/entities/user.js';
import { CreateUserResponse, toUserResponse, type CreateUserRequest } from './user.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { userFields, validateUserRelations } from './user.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateUserHandler implements Handler<CreateUserRequest, CreateUserResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
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
