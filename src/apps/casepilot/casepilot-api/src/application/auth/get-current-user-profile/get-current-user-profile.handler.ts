import type { Handler } from '@casepilot/cqrs';
import type { UnitOfWork } from '@casepilot/abstractions';
import { requireActiveUser } from '../../shared/authorization.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { loadCurrentUserProfile, type AuthScope } from '../shared/current-user-profile.response.js';
import type { GetCurrentUserProfileRequest } from './get-current-user-profile.request.js';
import { GetCurrentUserProfileResponse } from './get-current-user-profile.response.js';

export class GetCurrentUserProfileHandler implements Handler<GetCurrentUserProfileRequest, GetCurrentUserProfileResponse> {
  constructor(private readonly work: UnitOfWork<AuthScope>) {}

  async execute(request: GetCurrentUserProfileRequest): Promise<GetCurrentUserProfileResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      const user = await requireActiveUser(scope, request.actor);
      const profile = await loadCurrentUserProfile(scope, user);
      return new GetCurrentUserProfileResponse(profile);
    }, 'REPEATABLE READ'));
  }
}
