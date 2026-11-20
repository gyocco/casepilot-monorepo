import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Note } from '../../../domain/entities/note.js';
import { GetNoteResponse } from './get-note.response.js';
import { toNoteResponse } from '../shared/note.response.js';
import { type GetNoteRequest } from './get-note.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetNoteHandler implements Handler<GetNoteRequest, GetNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>) {}

  async execute(request: GetNoteRequest): Promise<GetNoteResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetNoteResponse(toNoteResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
