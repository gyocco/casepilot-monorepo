import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Document } from '../../domain/entities/document.js';
import { UpdateDocumentResponse, toDocumentResponse, type UpdateDocumentRequest } from './document.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { documentFields, validateDocumentRelations } from './document.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateDocumentHandler implements Handler<UpdateDocumentRequest, UpdateDocumentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Document>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateDocumentRequest): Promise<UpdateDocumentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, documentFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Document();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.externalPartyId = request.data.externalPartyId !== undefined ? request.data.externalPartyId : existing.externalPartyId;
      entity.folderId = request.data.folderId !== undefined ? request.data.folderId : existing.folderId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.documentType = request.data.documentType !== undefined ? request.data.documentType : existing.documentType;
      entity.currentVersionId = request.data.currentVersionId !== undefined ? request.data.currentVersionId : existing.currentVersionId;
      entity.createdByMemberId = request.data.createdByMemberId !== undefined ? request.data.createdByMemberId : existing.createdByMemberId;
      await validateDocumentRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateDocumentResponse(toDocumentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
