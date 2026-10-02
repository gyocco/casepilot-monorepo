import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Payment } from '../../domain/entities/payment.js';
import { ListPaymentsResponse, toPaymentResponse, type ListPaymentsRequest } from './payment.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { paymentSortFields } from './payment.rules.js';

export class ListPaymentsHandler implements Handler<ListPaymentsRequest, ListPaymentsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>) {}

  async execute(request: ListPaymentsRequest): Promise<ListPaymentsResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, paymentSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListPaymentsResponse(items.map(toPaymentResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
