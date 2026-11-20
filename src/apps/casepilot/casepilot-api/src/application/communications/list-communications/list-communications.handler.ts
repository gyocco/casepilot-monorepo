import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Communication } from '../../../domain/entities/communication.js';
import { ListCommunicationsResponse } from './list-communications.response.js';
import { toCommunicationResponse } from '../shared/communication.response.js';
import { type ListCommunicationsRequest } from './list-communications.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { communicationSortFields } from '../shared/communication.rules.js';

export class ListCommunicationsHandler implements Handler<ListCommunicationsRequest, ListCommunicationsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>) {}

  async execute(request: ListCommunicationsRequest): Promise<ListCommunicationsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, communicationSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCommunicationsResponse(items.map(toCommunicationResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
