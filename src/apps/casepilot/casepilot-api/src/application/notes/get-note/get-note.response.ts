import type { NoteResponse } from '../shared/note.response.js';
import { Response } from '@casepilot/cqrs';

export class GetNoteResponse extends Response {
  constructor(public readonly item: NoteResponse) { super(); }
}
