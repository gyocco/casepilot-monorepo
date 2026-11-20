import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { TimeEntry } from '../../../domain/entities/time-entry.js';
import { ListTimeEntriesResponse } from './list-time-entries.response.js';
import { toTimeEntryResponse } from '../shared/time-entry.response.js';
import { type ListTimeEntriesRequest } from './list-time-entries.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { time_entrySortFields } from '../shared/time-entry.rules.js';

export class ListTimeEntriesHandler implements Handler<ListTimeEntriesRequest, ListTimeEntriesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<TimeEntry>>) {}

  async execute(request: ListTimeEntriesRequest): Promise<ListTimeEntriesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, time_entrySortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListTimeEntriesResponse(items.map(toTimeEntryResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
