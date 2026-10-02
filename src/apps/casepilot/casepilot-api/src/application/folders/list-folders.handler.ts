import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Folder } from '../../domain/entities/folder.js';
import { ListFoldersResponse, toFolderResponse, type ListFoldersRequest } from './folder.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { folderSortFields } from './folder.rules.js';

export class ListFoldersHandler implements Handler<ListFoldersRequest, ListFoldersResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Folder>>) {}

  async execute(request: ListFoldersRequest): Promise<ListFoldersResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, folderSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListFoldersResponse(items.map(toFolderResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
