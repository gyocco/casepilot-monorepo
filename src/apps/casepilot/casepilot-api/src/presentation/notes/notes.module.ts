import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Note } from '../../domain/entities/note.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmNoteRepository } from '../../infrastructure/persistence/repositories/typeorm-note.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateNoteHandler } from '../../application/notes/create-note/create-note.handler.js';
import { GetNoteHandler } from '../../application/notes/get-note/get-note.handler.js';
import { UpdateNoteHandler } from '../../application/notes/update-note/update-note.handler.js';
import { DeleteNoteHandler } from '../../application/notes/delete-note/delete-note.handler.js';
import { ListNotesHandler } from '../../application/notes/list-notes/list-notes.handler.js';
import { NotesController } from './notes.controller.js';
const WORK = Symbol('Notes_WORK');
@Module({
  controllers: [NotesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Note>> =>
        new TypeOrmUnitOfWork<CrudScope<Note>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmNoteRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateNoteHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Note>>): CreateNoteHandler => new CreateNoteHandler(work, systemCrudRuntime),
    },
    {
      provide: GetNoteHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Note>>): GetNoteHandler => new GetNoteHandler(work),
    },
    {
      provide: UpdateNoteHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Note>>): UpdateNoteHandler => new UpdateNoteHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteNoteHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Note>>): DeleteNoteHandler => new DeleteNoteHandler(work),
    },
    {
      provide: ListNotesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Note>>): ListNotesHandler => new ListNotesHandler(work),
    },
  ],
})
export class NotesModule {}
