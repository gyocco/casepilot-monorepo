import type { TimeEntryResponse } from '../shared/time-entry.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListTimeEntriesResponse extends Response {
  constructor(public readonly items: readonly TimeEntryResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
