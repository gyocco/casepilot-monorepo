import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { CaseExternalParty } from '../../../domain/entities/case-external-party.js';
import { ListCaseExternalPartiesResponse } from './list-case-external-parties.response.js';
import { toCaseExternalPartyResponse } from '../shared/case-external-party.response.js';
import { type ListCaseExternalPartiesRequest } from './list-case-external-parties.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validatePage } from '../../shared/crud-pagination.js';
import { case_external_partySortFields } from '../shared/case-external-party.rules.js';

export class ListCaseExternalPartiesHandler implements Handler<ListCaseExternalPartiesRequest, ListCaseExternalPartiesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseExternalParty>>) {}

  async execute(request: ListCaseExternalPartiesRequest): Promise<ListCaseExternalPartiesResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, case_external_partySortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCaseExternalPartiesResponse(items.map(toCaseExternalPartyResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
