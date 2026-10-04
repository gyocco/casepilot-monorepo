import type { CommentResponse } from '../shared/comment.response.js';
import { Response } from '@casepilot/cqrs';

export class GetCommentResponse extends Response {
  constructor(public readonly item: CommentResponse) { super(); }
}
