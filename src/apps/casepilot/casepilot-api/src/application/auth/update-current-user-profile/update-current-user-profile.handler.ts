import type { Handler } from '@casepilot/cqrs';
import { ConflictError, ValidationError, type CrudRuntime, type UnitOfWork } from '@casepilot/abstractions';
import { User } from '../../../domain/entities/user.js';
import { requireActiveUser } from '../../shared/authorization.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateFields } from '../../shared/crud-validation.js';
import { currentUserProfileUpdateFields, loadCurrentUserProfile, type AuthScope } from '../shared/current-user-profile.response.js';
import type { UpdateCurrentUserProfileRequest } from './update-current-user-profile.request.js';
import { UpdateCurrentUserProfileResponse } from './update-current-user-profile.response.js';

export class UpdateCurrentUserProfileHandler implements Handler<UpdateCurrentUserProfileRequest, UpdateCurrentUserProfileResponse> {
  constructor(
    private readonly work: UnitOfWork<AuthScope>,
    private readonly runtime: CrudRuntime,
  ) {}

  async execute(request: UpdateCurrentUserProfileRequest): Promise<UpdateCurrentUserProfileResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      const existing = await requireActiveUser(scope, request.actor);
      validateVersion(request.version);
      validateFields(request.data, currentUserProfileUpdateFields, true);
      if (Object.values(request.data).every(value => value === undefined)) {
        throw new ValidationError('At least one profile field is required.');
      }
      if (existing.version !== request.version) {
        throw new ConflictError('The record version is stale.');
      }

      const entity = new User();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.email = existing.email;
      entity.emailVerifiedAt = existing.emailVerifiedAt;
      entity.firstName = request.data.firstName !== undefined ? request.data.firstName.trim() : existing.firstName;
      entity.lastName = request.data.lastName !== undefined ? request.data.lastName.trim() : existing.lastName;
      entity.displayName = request.data.displayName !== undefined ? request.data.displayName : existing.displayName;
      entity.avatarUrl = existing.avatarUrl;
      entity.locale = request.data.locale !== undefined ? request.data.locale : existing.locale;
      entity.timezone = request.data.timezone !== undefined ? request.data.timezone : existing.timezone;
      entity.status = existing.status;
      entity.lastLoginAt = existing.lastLoginAt;

      const stored = await scope.users.update(entity, null, request.version);
      if (!stored) {
        throw new ConflictError('The record changed concurrently.');
      }
      const profile = await loadCurrentUserProfile(scope, stored);
      return new UpdateCurrentUserProfileResponse(profile);
    }, 'SERIALIZABLE'));
  }
}
