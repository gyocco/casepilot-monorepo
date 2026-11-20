import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Document } from '../../../domain/entities/document.js';
import { ListDocumentsResponse } from './list-documents.response.js';
import { toDocumentResponse } from '../shared/document.response.js';
import { type ListDocumentsRequest } from './list-documents.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { documentSortFields } from '../shared/document.rules.js';

export class ListDocumentsHandler implements Handler<ListDocumentsRequest, ListDocumentsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Document>>) {}

  async execute(request: ListDocumentsRequest): Promise<ListDocumentsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, documentSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListDocumentsResponse(items.map(toDocumentResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
