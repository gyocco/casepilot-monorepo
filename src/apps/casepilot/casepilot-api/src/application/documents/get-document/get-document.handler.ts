import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Document } from '../../../domain/entities/document.js';
import { GetDocumentResponse } from './get-document.response.js';
import { toDocumentResponse } from '../shared/document.response.js';
import { type GetDocumentRequest } from './get-document.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetDocumentHandler implements Handler<GetDocumentRequest, GetDocumentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Document>>) {}

  async execute(request: GetDocumentRequest): Promise<GetDocumentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetDocumentResponse(toDocumentResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
