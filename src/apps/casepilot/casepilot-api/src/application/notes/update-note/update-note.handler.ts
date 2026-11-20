import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Note } from '../../../domain/entities/note.js';
import { UpdateNoteResponse } from './update-note.response.js';
import { toNoteResponse } from '../shared/note.response.js';
import { type UpdateNoteRequest } from './update-note.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { noteFields, validateNoteRelations } from '../shared/note.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateNoteHandler implements Handler<UpdateNoteRequest, UpdateNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateNoteRequest): Promise<UpdateNoteResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, noteFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Note();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.externalPartyId = request.data.externalPartyId !== undefined ? request.data.externalPartyId : existing.externalPartyId;
      entity.authorMemberId = request.data.authorMemberId !== undefined ? request.data.authorMemberId : existing.authorMemberId;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.body = request.data.body !== undefined ? request.data.body : existing.body;
      entity.isPrivate = request.data.isPrivate !== undefined ? request.data.isPrivate : existing.isPrivate;
      await validateNoteRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateNoteResponse(toNoteResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
