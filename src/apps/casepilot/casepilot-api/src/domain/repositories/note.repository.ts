import type { DataRepository } from './data.repository.js';
import type { Note } from '../entities/note.js';
export interface NoteRepository extends DataRepository<Note> {
  readonly entityType?: Note;
}
