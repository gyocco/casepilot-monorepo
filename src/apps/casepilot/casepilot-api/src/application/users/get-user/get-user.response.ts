import type { UserResponse } from '../shared/user.response.js';
import { Response } from '@casepilot/cqrs';

export class GetUserResponse extends Response {
  constructor(public readonly item: UserResponse) { super(); }
}
