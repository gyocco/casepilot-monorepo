import type { DeadlineResponse } from '../shared/deadline.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateDeadlineResponse extends Response {
  constructor(public readonly item: DeadlineResponse) { super(); }
}
