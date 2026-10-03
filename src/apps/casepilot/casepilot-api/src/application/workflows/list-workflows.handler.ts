import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Workflow } from '../../domain/entities/workflow.js';
import { ListWorkflowsResponse, toWorkflowResponse, type ListWorkflowsRequest } from './workflow.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { workflowSortFields } from './workflow.rules.js';

export class ListWorkflowsHandler implements Handler<ListWorkflowsRequest, ListWorkflowsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Workflow>>) {}

  async execute(request: ListWorkflowsRequest): Promise<ListWorkflowsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, workflowSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListWorkflowsResponse(items.map(toWorkflowResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
