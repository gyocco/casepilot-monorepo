import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Payment } from '../../../domain/entities/payment.js';
import { ListPaymentsResponse } from './list-payments.response.js';
import { toPaymentResponse } from '../shared/payment.response.js';
import { type ListPaymentsRequest } from './list-payments.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { paymentSortFields } from '../shared/payment.rules.js';

export class ListPaymentsHandler implements Handler<ListPaymentsRequest, ListPaymentsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>) {}

  async execute(request: ListPaymentsRequest): Promise<ListPaymentsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, paymentSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListPaymentsResponse(items.map(toPaymentResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
