import type { Handler } from '@casepilot/cqrs';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { PageResponse, type UnitOfWork } from '@casepilot/abstractions';
import type { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { BusinessAccountRepository } from '../../../domain/repositories/business-account.repository.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { authorizeBusinessAccountAction } from '../../shared/authorization.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { business_accountSortFields } from '../shared/business-account.rules.js';
import { toBusinessAccountResponse } from '../shared/business-account.response.js';
import type { ListBusinessAccountsRequest } from './list-business-accounts.request.js';
import { ListBusinessAccountsResponse } from './list-business-accounts.response.js';

export interface BusinessAccountListScope extends CrudScope<BusinessAccount> {
  readonly resource: BusinessAccountRepository;
}

function sortableValue(account: BusinessAccount, field: string): string | number {
  switch (field) {
    case 'id': return account.id;
    case 'createdAt': return account.createdAt;
    case 'updatedAt': return account.updatedAt;
    case 'version': return account.version;
    case 'name': return account.name;
    case 'legalName': return account.legalName ?? '';
    case 'slug': return account.slug ?? '';
    case 'type': return account.type ?? '';
    case 'taxId': return account.taxId ?? '';
    case 'email': return account.email ?? '';
    case 'phone': return account.phone ?? '';
    case 'website': return account.website ?? '';
    case 'timezone': return account.timezone;
    case 'locale': return account.locale;
    case 'currency': return account.currency;
    case 'countryCode': return account.countryCode;
    case 'status': return account.status;
    default: return account.id;
  }
}

export class ListBusinessAccountsHandler implements Handler<ListBusinessAccountsRequest, ListBusinessAccountsResponse> {
  constructor(private readonly work: UnitOfWork<BusinessAccountListScope>) {}

  async execute(request: ListBusinessAccountsRequest): Promise<ListBusinessAccountsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      const { activeAccountIds } = await authorizeBusinessAccountAction(scope, request.actor, 'list');
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, business_accountSortFields);
      const allAllowed = [...await scope.resource.listByIds(activeAccountIds)];
      const sortField = page.sortBy ?? 'id';
      const direction = page.sortDirection === 'desc' ? -1 : 1;
      allAllowed.sort((left, right) => {
        const a = sortableValue(left, sortField);
        const b = sortableValue(right, sortField);
        if (a < b) return -1 * direction;
        if (a > b) return 1 * direction;
        return left.id.localeCompare(right.id);
      });
      const items = allAllowed.slice(page.offset, page.offset + page.pageSize);
      const result = new PageResponse(page, items, allAllowed.length);
      return new ListBusinessAccountsResponse(
        items.map(toBusinessAccountResponse),
        new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage),
      );
    }, 'REPEATABLE READ'));
  }
}
