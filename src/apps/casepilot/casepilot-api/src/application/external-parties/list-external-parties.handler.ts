import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { ExternalParty } from '../../domain/entities/external-party.js';
import { ListExternalPartiesResponse, toExternalPartyResponse, type ListExternalPartiesRequest } from './external-party.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { external_partySortFields } from './external-party.rules.js';

export class ListExternalPartiesHandler implements Handler<ListExternalPartiesRequest, ListExternalPartiesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<ExternalParty>>) {}

  async execute(request: ListExternalPartiesRequest): Promise<ListExternalPartiesResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, external_partySortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListExternalPartiesResponse(items.map(toExternalPartyResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
