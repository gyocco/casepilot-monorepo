import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { DocumentVersion } from '../../../domain/entities/document-version.js';
import { UpdateDocumentVersionResponse } from './update-document-version.response.js';
import { toDocumentVersionResponse } from '../shared/document-version.response.js';
import { type UpdateDocumentVersionRequest } from './update-document-version.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { document_versionFields, validateDocumentVersionRelations } from '../shared/document-version.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateDocumentVersionHandler implements Handler<UpdateDocumentVersionRequest, UpdateDocumentVersionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<DocumentVersion>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateDocumentVersionRequest): Promise<UpdateDocumentVersionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, document_versionFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new DocumentVersion();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.documentId = request.data.documentId !== undefined ? request.data.documentId : existing.documentId;
      entity.versionNumber = request.data.versionNumber !== undefined ? request.data.versionNumber : existing.versionNumber;
      entity.storageKey = request.data.storageKey !== undefined ? request.data.storageKey : existing.storageKey;
      entity.fileName = request.data.fileName !== undefined ? request.data.fileName : existing.fileName;
      entity.mimeType = request.data.mimeType !== undefined ? request.data.mimeType : existing.mimeType;
      entity.sizeBytes = request.data.sizeBytes !== undefined ? request.data.sizeBytes : existing.sizeBytes;
      entity.checksum = request.data.checksum !== undefined ? request.data.checksum : existing.checksum;
      entity.uploadedByMemberId = request.data.uploadedByMemberId !== undefined ? request.data.uploadedByMemberId : existing.uploadedByMemberId;
      await validateDocumentVersionRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateDocumentVersionResponse(toDocumentVersionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
