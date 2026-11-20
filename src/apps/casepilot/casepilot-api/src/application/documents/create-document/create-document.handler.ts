import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Document } from '../../../domain/entities/document.js';
import { CreateDocumentResponse } from './create-document.response.js';
import { toDocumentResponse } from '../shared/document.response.js';
import { type CreateDocumentRequest } from './create-document.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { documentFields, validateDocumentRelations } from '../shared/document.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateDocumentHandler implements Handler<CreateDocumentRequest, CreateDocumentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Document>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateDocumentRequest): Promise<CreateDocumentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, documentFields, false);
      const entity = new Document();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.externalPartyId = request.data.externalPartyId ?? null;
      entity.folderId = request.data.folderId ?? null;
      entity.name = request.data.name;
      entity.description = request.data.description ?? null;
      entity.documentType = request.data.documentType ?? null;
      entity.currentVersionId = request.data.currentVersionId ?? null;
      entity.createdByMemberId = request.data.createdByMemberId;
      await validateDocumentRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateDocumentResponse(toDocumentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
