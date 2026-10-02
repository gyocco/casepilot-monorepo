import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Note } from '../../domain/entities/note.js';
import { UpdateNoteResponse, toNoteResponse, type UpdateNoteRequest } from './note.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { noteFields, validateNoteRelations } from './note.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateNoteHandler implements Handler<UpdateNoteRequest, UpdateNoteResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateNoteRequest): Promise<UpdateNoteResponse> {
    return runPersistence(() => this.work.execute(async scope => {
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
