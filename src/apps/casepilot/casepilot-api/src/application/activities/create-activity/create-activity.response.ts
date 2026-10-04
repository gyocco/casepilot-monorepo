import type { ActivityResponse } from '../shared/activity.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateActivityResponse extends Response {
  constructor(public readonly item: ActivityResponse) { super(); }
}
