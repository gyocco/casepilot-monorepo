import type { UserResponse } from '../shared/user.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListUsersResponse extends Response {
  constructor(public readonly items: readonly UserResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
