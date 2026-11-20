import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { CaseMember } from '../../../domain/entities/case-member.js';
import { ListCaseMembersResponse } from './list-case-members.response.js';
import { toCaseMemberResponse } from '../shared/case-member.response.js';
import { type ListCaseMembersRequest } from './list-case-members.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { case_memberSortFields } from '../shared/case-member.rules.js';

export class ListCaseMembersHandler implements Handler<ListCaseMembersRequest, ListCaseMembersResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseMember>>) {}

  async execute(request: ListCaseMembersRequest): Promise<ListCaseMembersResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, case_memberSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCaseMembersResponse(items.map(toCaseMemberResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
