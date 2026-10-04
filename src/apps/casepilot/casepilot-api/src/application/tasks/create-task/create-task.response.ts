import type { TaskResponse } from '../shared/task.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateTaskResponse extends Response {
  constructor(public readonly item: TaskResponse) { super(); }
}
