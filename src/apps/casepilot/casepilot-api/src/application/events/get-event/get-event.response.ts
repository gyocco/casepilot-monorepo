import type { EventResponse } from '../shared/event.response.js';
import { Response } from '@casepilot/cqrs';

export class GetEventResponse extends Response {
  constructor(public readonly item: EventResponse) { super(); }
}
