import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { DocumentVersion } from '../../../domain/entities/document-version.js';
import { ListDocumentVersionsResponse } from './list-document-versions.response.js';
import { toDocumentVersionResponse } from '../shared/document-version.response.js';
import { type ListDocumentVersionsRequest } from './list-document-versions.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { document_versionSortFields } from '../shared/document-version.rules.js';

export class ListDocumentVersionsHandler implements Handler<ListDocumentVersionsRequest, ListDocumentVersionsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<DocumentVersion>>) {}

  async execute(request: ListDocumentVersionsRequest): Promise<ListDocumentVersionsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, document_versionSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListDocumentVersionsResponse(items.map(toDocumentVersionResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
