import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { DocumentVersion } from '../../../domain/entities/document-version.js';
import { GetDocumentVersionResponse } from './get-document-version.response.js';
import { toDocumentVersionResponse } from '../shared/document-version.response.js';
import { type GetDocumentVersionRequest } from './get-document-version.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetDocumentVersionHandler implements Handler<GetDocumentVersionRequest, GetDocumentVersionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<DocumentVersion>>) {}

  async execute(request: GetDocumentVersionRequest): Promise<GetDocumentVersionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetDocumentVersionResponse(toDocumentVersionResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
