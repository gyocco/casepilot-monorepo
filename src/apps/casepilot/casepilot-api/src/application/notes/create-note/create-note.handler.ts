import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Note } from '../../../domain/entities/note.js';
import { CreateNoteResponse } from './create-note.response.js';
import { toNoteResponse } from '../shared/note.response.js';
import { type CreateNoteRequest } from './create-note.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { noteFields, validateNoteRelations } from '../shared/note.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateNoteHandler implements Handler<CreateNoteRequest, CreateNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateNoteRequest): Promise<CreateNoteResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, noteFields, false);
      const entity = new Note();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.externalPartyId = request.data.externalPartyId ?? null;
      entity.authorMemberId = request.data.authorMemberId;
      entity.title = request.data.title ?? null;
      entity.body = request.data.body;
      entity.isPrivate = request.data.isPrivate;
      await validateNoteRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateNoteResponse(toNoteResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
