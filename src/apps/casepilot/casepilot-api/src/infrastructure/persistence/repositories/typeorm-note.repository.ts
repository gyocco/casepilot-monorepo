import type { EntityManager } from 'typeorm';
import type { Note } from '../../../domain/entities/note.js';
import type { NoteRepository } from '../../../domain/repositories/note.repository.js';
import { noteTable } from '../schemas/note.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmNoteRepository extends TypeOrmDataRepository<Note> implements NoteRepository {
  constructor(manager: EntityManager) { super(manager, noteTable); }
}
