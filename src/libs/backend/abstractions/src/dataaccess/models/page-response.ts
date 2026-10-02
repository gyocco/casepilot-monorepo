import type { Entity } from './entity.js';
import type { PageRequest } from './page-request.js';

/** Materialized page and metadata, without deferred I/O or product calculations. */
export class PageResponse<TEntity extends Entity> {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly items: readonly TEntity[];
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;

  constructor(request: PageRequest, items: readonly TEntity[], totalCount: number) {
    if (!Number.isSafeInteger(totalCount) || totalCount < 0) throw new RangeError('totalCount must be a non-negative safe integer.');
    if (items.length > request.pageSize || items.length > totalCount) throw new RangeError('Items exceed pageSize or totalCount.');
    this.pageNumber = request.pageNumber;
    this.pageSize = request.pageSize;
    this.items = Object.freeze([...items]);
    this.totalCount = totalCount;
    this.totalPages = Math.ceil(totalCount / request.pageSize);
    this.hasNextPage = this.pageNumber < this.totalPages;
    this.hasPreviousPage = this.pageNumber > 1;
  }
}
