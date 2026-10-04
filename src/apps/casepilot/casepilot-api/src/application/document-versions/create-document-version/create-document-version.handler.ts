import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { DocumentVersion } from '../../../domain/entities/document-version.js';
import { CreateDocumentVersionResponse } from './create-document-version.response.js';
import { toDocumentVersionResponse } from '../shared/document-version.response.js';
import { type CreateDocumentVersionRequest } from './create-document-version.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { document_versionFields, validateDocumentVersionRelations } from '../shared/document-version.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateDocumentVersionHandler implements Handler<CreateDocumentVersionRequest, CreateDocumentVersionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<DocumentVersion>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateDocumentVersionRequest): Promise<CreateDocumentVersionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, document_versionFields, false);
      const entity = new DocumentVersion();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.documentId = request.data.documentId;
      entity.versionNumber = request.data.versionNumber;
      entity.storageKey = request.data.storageKey;
      entity.fileName = request.data.fileName;
      entity.mimeType = request.data.mimeType;
      entity.sizeBytes = request.data.sizeBytes;
      entity.checksum = request.data.checksum ?? null;
      entity.uploadedByMemberId = request.data.uploadedByMemberId;
      await validateDocumentVersionRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateDocumentVersionResponse(toDocumentVersionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
