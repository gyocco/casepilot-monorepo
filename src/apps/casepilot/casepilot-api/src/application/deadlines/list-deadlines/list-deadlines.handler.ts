import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Deadline } from '../../../domain/entities/deadline.js';
import { ListDeadlinesResponse } from './list-deadlines.response.js';
import { toDeadlineResponse } from '../shared/deadline.response.js';
import { type ListDeadlinesRequest } from './list-deadlines.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { deadlineSortFields } from '../shared/deadline.rules.js';

export class ListDeadlinesHandler implements Handler<ListDeadlinesRequest, ListDeadlinesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Deadline>>) {}

  async execute(request: ListDeadlinesRequest): Promise<ListDeadlinesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, deadlineSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListDeadlinesResponse(items.map(toDeadlineResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
