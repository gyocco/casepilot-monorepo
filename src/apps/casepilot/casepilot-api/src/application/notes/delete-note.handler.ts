import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Note } from '../../domain/entities/note.js';
import { DeleteNoteResponse, type DeleteNoteRequest } from './note.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class DeleteNoteHandler implements Handler<DeleteNoteRequest, DeleteNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>) {}

  async execute(request: DeleteNoteRequest): Promise<DeleteNoteResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const deleted = await scope.resource.delete(request.id, request.businessAccountId, request.version);
      if (!deleted) throw new ConflictError('The record changed concurrently.');
      return new DeleteNoteResponse(request.id, true);
    }, 'SERIALIZABLE'));
  }
}
