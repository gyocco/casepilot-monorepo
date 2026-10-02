import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.js';
import { ListCustomFieldDefinitionsResponse, toCustomFieldDefinitionResponse, type ListCustomFieldDefinitionsRequest } from './custom-field-definition.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { custom_field_definitionSortFields } from './custom-field-definition.rules.js';

export class ListCustomFieldDefinitionsHandler implements Handler<ListCustomFieldDefinitionsRequest, ListCustomFieldDefinitionsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CustomFieldDefinition>>) {}

  async execute(request: ListCustomFieldDefinitionsRequest): Promise<ListCustomFieldDefinitionsResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, custom_field_definitionSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCustomFieldDefinitionsResponse(items.map(toCustomFieldDefinitionResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
