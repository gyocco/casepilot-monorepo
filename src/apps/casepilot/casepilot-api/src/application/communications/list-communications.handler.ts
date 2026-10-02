import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Communication } from '../../domain/entities/communication.js';
import { ListCommunicationsResponse, toCommunicationResponse, type ListCommunicationsRequest } from './communication.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { communicationSortFields } from './communication.rules.js';

export class ListCommunicationsHandler implements Handler<ListCommunicationsRequest, ListCommunicationsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>) {}

  async execute(request: ListCommunicationsRequest): Promise<ListCommunicationsResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, communicationSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCommunicationsResponse(items.map(toCommunicationResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
