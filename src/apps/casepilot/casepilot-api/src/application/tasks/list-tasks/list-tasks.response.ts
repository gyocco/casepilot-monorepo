import type { TaskResponse } from '../shared/task.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListTasksResponse extends Response {
  constructor(public readonly items: readonly TaskResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
