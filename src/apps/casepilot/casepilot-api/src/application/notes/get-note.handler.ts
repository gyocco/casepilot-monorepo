import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Note } from '../../domain/entities/note.js';
import { GetNoteResponse, toNoteResponse, type GetNoteRequest } from './note.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetNoteHandler implements Handler<GetNoteRequest, GetNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>) {}

  async execute(request: GetNoteRequest): Promise<GetNoteResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetNoteResponse(toNoteResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
