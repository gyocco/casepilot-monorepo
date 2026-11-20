import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { User } from '../../../domain/entities/user.js';
import { ListUsersResponse } from './list-users.response.js';
import { toUserResponse } from '../shared/user.response.js';
import { type ListUsersRequest } from './list-users.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeUserAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { userSortFields } from '../shared/user.rules.js';

export class ListUsersHandler implements Handler<ListUsersRequest, ListUsersResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<User>>) {}

  async execute(request: ListUsersRequest): Promise<ListUsersResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      await authorizeUserAction(scope, request.actor, 'list');
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, userSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListUsersResponse(items.map(toUserResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
