import { Response } from '@casepilot/cqrs';
import type { CurrentUserProfileResponse } from '../shared/current-user-profile.response.js';

export class GetCurrentUserProfileResponse extends Response {
  constructor(public readonly profile: CurrentUserProfileResponse) {
    super();
  }
}
