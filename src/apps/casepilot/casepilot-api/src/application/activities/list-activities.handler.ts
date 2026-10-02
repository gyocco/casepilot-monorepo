import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Activity } from '../../domain/entities/activity.js';
import { ListActivitiesResponse, toActivityResponse, type ListActivitiesRequest } from './activity.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { activitySortFields } from './activity.rules.js';

export class ListActivitiesHandler implements Handler<ListActivitiesRequest, ListActivitiesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Activity>>) {}

  async execute(request: ListActivitiesRequest): Promise<ListActivitiesResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, activitySortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListActivitiesResponse(items.map(toActivityResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
