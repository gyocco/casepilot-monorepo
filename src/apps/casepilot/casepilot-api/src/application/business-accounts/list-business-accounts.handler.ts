import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { BusinessAccount } from '../../domain/entities/business-account.js';
import { ListBusinessAccountsResponse, toBusinessAccountResponse, type ListBusinessAccountsRequest } from './business-account.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { business_accountSortFields } from './business-account.rules.js';

export class ListBusinessAccountsHandler implements Handler<ListBusinessAccountsRequest, ListBusinessAccountsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>) {}

  async execute(request: ListBusinessAccountsRequest): Promise<ListBusinessAccountsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, business_accountSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListBusinessAccountsResponse(items.map(toBusinessAccountResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
