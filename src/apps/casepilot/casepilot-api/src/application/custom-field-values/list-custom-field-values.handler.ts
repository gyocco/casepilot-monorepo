import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import { ListCustomFieldValuesResponse, toCustomFieldValueResponse, type ListCustomFieldValuesRequest } from './custom-field-value.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { custom_field_valueSortFields } from './custom-field-value.rules.js';

export class ListCustomFieldValuesHandler implements Handler<ListCustomFieldValuesRequest, ListCustomFieldValuesResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldValue>>) {}

  async execute(request: ListCustomFieldValuesRequest): Promise<ListCustomFieldValuesResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, custom_field_valueSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCustomFieldValuesResponse(items.map(toCustomFieldValueResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
