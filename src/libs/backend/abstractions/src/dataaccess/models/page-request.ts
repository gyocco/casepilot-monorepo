export type SortDirection = 'asc' | 'desc';

/** One-based pagination. Only technical validation; adapters allowlist sort fields. */
export class PageRequest {
  constructor(
    public readonly pageNumber = 1,
    public readonly pageSize = 20,
    public readonly sortBy?: string,
    public readonly sortDirection: SortDirection = 'asc',
  ) {
    if (!Number.isSafeInteger(pageNumber) || pageNumber < 1) throw new RangeError('pageNumber must be a positive safe integer.');
    if (!Number.isSafeInteger(pageSize) || pageSize < 1) throw new RangeError('pageSize must be a positive safe integer.');
    if (!Number.isSafeInteger((pageNumber - 1) * pageSize)) throw new RangeError('Pagination offset exceeds the safe integer range.');
    if (sortDirection !== 'asc' && sortDirection !== 'desc') throw new RangeError('sortDirection must be asc or desc.');
  }

  get offset(): number { return (this.pageNumber - 1) * this.pageSize; }
}
