import type { DeadlineResponse } from '../shared/deadline.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListDeadlinesResponse extends Response {
  constructor(public readonly items: readonly DeadlineResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
