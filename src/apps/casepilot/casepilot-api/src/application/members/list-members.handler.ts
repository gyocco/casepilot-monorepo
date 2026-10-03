import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Member } from '../../domain/entities/member.js';
import { ListMembersResponse, toMemberResponse, type ListMembersRequest } from './member.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { memberSortFields } from './member.rules.js';

export class ListMembersHandler implements Handler<ListMembersRequest, ListMembersResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Member>>) {}

  async execute(request: ListMembersRequest): Promise<ListMembersResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, memberSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListMembersResponse(items.map(toMemberResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
