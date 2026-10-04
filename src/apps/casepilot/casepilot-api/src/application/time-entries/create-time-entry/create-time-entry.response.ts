import type { TimeEntryResponse } from '../shared/time-entry.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateTimeEntryResponse extends Response {
  constructor(public readonly item: TimeEntryResponse) { super(); }
}
