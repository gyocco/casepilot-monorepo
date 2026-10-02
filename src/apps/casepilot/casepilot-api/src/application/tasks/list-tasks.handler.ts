import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Task } from '../../domain/entities/task.js';
import { ListTasksResponse, toTaskResponse, type ListTasksRequest } from './task.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { taskSortFields } from './task.rules.js';

export class ListTasksHandler implements Handler<ListTasksRequest, ListTasksResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Task>>) {}

  async execute(request: ListTasksRequest): Promise<ListTasksResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, taskSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListTasksResponse(items.map(toTaskResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
