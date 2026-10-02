import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { StatusDefinition } from '../../domain/entities/status-definition.js';
import { ListStatusDefinitionsResponse, toStatusDefinitionResponse, type ListStatusDefinitionsRequest } from './status-definition.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { status_definitionSortFields } from './status-definition.rules.js';

export class ListStatusDefinitionsHandler implements Handler<ListStatusDefinitionsRequest, ListStatusDefinitionsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<StatusDefinition>>) {}

  async execute(request: ListStatusDefinitionsRequest): Promise<ListStatusDefinitionsResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, status_definitionSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListStatusDefinitionsResponse(items.map(toStatusDefinitionResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
