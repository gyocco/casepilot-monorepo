import type { EventResponse } from '../shared/event.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListEventsResponse extends Response {
  constructor(public readonly items: readonly EventResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
