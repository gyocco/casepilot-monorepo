import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Note } from '../entities/note.js';
export interface NoteRepository extends DataRepository<Note> {
  readonly entityType?: Note;
}
