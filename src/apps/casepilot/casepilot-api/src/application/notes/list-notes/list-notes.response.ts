import type { NoteResponse } from '../shared/note.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListNotesResponse extends Response {
  constructor(public readonly items: readonly NoteResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
