import { Response } from '@casepilot/cqrs';
import type { CurrentUserProfileResponse } from '../shared/current-user-profile.response.js';

export class BootstrapCurrentUserResponse extends Response {
  constructor(
    public readonly profile: CurrentUserProfileResponse,
    public readonly provisioned: boolean,
  ) {
    super();
  }
}
