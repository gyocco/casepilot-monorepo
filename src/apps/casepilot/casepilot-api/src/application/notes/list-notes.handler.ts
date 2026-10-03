import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Note } from '../../domain/entities/note.js';
import { ListNotesResponse, toNoteResponse, type ListNotesRequest } from './note.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { noteSortFields } from './note.rules.js';

export class ListNotesHandler implements Handler<ListNotesRequest, ListNotesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Note>>) {}

  async execute(request: ListNotesRequest): Promise<ListNotesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, noteSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListNotesResponse(items.map(toNoteResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
