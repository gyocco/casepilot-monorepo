import type { EventResponse } from '../shared/event.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateEventResponse extends Response {
  constructor(public readonly item: EventResponse) { super(); }
}
