import type { CommentResponse } from '../shared/comment.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCommentsResponse extends Response {
  constructor(public readonly items: readonly CommentResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
