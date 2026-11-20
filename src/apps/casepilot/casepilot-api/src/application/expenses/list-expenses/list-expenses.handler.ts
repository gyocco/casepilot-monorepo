import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Expense } from '../../../domain/entities/expense.js';
import { ListExpensesResponse } from './list-expenses.response.js';
import { toExpenseResponse } from '../shared/expense.response.js';
import { type ListExpensesRequest } from './list-expenses.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { expenseSortFields } from '../shared/expense.rules.js';

export class ListExpensesHandler implements Handler<ListExpensesRequest, ListExpensesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Expense>>) {}

  async execute(request: ListExpensesRequest): Promise<ListExpensesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, expenseSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListExpensesResponse(items.map(toExpenseResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
