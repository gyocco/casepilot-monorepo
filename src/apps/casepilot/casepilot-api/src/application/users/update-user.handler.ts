import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { User } from '../../domain/entities/user.js';
import { UpdateUserResponse, toUserResponse, type UpdateUserRequest } from './user.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { userFields, validateUserRelations } from './user.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateUserHandler implements Handler<UpdateUserRequest, UpdateUserResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, userFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new User();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.email = request.data.email !== undefined ? request.data.email : existing.email;
      entity.emailVerifiedAt = request.data.emailVerifiedAt !== undefined ? request.data.emailVerifiedAt : existing.emailVerifiedAt;
      entity.firstName = request.data.firstName !== undefined ? request.data.firstName : existing.firstName;
      entity.lastName = request.data.lastName !== undefined ? request.data.lastName : existing.lastName;
      entity.displayName = request.data.displayName !== undefined ? request.data.displayName : existing.displayName;
      entity.avatarUrl = request.data.avatarUrl !== undefined ? request.data.avatarUrl : existing.avatarUrl;
      entity.locale = request.data.locale !== undefined ? request.data.locale : existing.locale;
      entity.timezone = request.data.timezone !== undefined ? request.data.timezone : existing.timezone;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.lastLoginAt = request.data.lastLoginAt !== undefined ? request.data.lastLoginAt : existing.lastLoginAt;
      entity.email = entity.email.trim().toLowerCase();
      validateUserRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateUserResponse(toUserResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
