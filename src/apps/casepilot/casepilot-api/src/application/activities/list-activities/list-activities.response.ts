import type { ActivityResponse } from '../shared/activity.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListActivitiesResponse extends Response {
  constructor(public readonly items: readonly ActivityResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
