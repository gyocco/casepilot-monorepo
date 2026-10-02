import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { Comment } from '../../domain/entities/comment.js';
import { ListCommentsResponse, toCommentResponse, type ListCommentsRequest } from './comment.models.js';
import { PageMetadataResponse, type CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { commentSortFields } from './comment.rules.js';

export class ListCommentsHandler implements Handler<ListCommentsRequest, ListCommentsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Comment>>) {}

  async execute(request: ListCommentsRequest): Promise<ListCommentsResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, commentSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListCommentsResponse(items.map(toCommentResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
