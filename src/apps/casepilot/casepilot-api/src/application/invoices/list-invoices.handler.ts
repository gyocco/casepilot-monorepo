import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Invoice } from '../../domain/entities/invoice.js';
import { ListInvoicesResponse, toInvoiceResponse, type ListInvoicesRequest } from './invoice.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { invoiceSortFields } from './invoice.rules.js';

export class ListInvoicesHandler implements Handler<ListInvoicesRequest, ListInvoicesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Invoice>>) {}

  async execute(request: ListInvoicesRequest): Promise<ListInvoicesResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, invoiceSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListInvoicesResponse(items.map(toInvoiceResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
