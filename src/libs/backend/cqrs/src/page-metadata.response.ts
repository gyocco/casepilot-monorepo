import { Response } from './response.js';

/** Transport-independent structure; Application supplies the calculated metadata. */
export class PageMetadataResponse extends Response {
  constructor(
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly totalCount: number,
    public readonly totalPages: number,
    public readonly hasNextPage: boolean,
    public readonly hasPreviousPage: boolean,
  ) { super(); }
}
