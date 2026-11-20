import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { CaseType } from '../../../domain/entities/case-type.js';
import { ListCaseTypesResponse } from './list-case-types.response.js';
import { toCaseTypeResponse } from '../shared/case-type.response.js';
import { type ListCaseTypesRequest } from './list-case-types.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { case_typeSortFields } from '../shared/case-type.rules.js';

export class ListCaseTypesHandler implements Handler<ListCaseTypesRequest, ListCaseTypesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>) {}

  async execute(request: ListCaseTypesRequest): Promise<ListCaseTypesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, case_typeSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCaseTypesResponse(items.map(toCaseTypeResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
