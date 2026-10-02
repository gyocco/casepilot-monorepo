import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { DocumentVersion } from '../../domain/entities/document-version.js';
import { GetDocumentVersionResponse, toDocumentVersionResponse, type GetDocumentVersionRequest } from './document-version.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetDocumentVersionHandler implements Handler<GetDocumentVersionRequest, GetDocumentVersionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<DocumentVersion>>) {}

  async execute(request: GetDocumentVersionRequest): Promise<GetDocumentVersionResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetDocumentVersionResponse(toDocumentVersionResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
