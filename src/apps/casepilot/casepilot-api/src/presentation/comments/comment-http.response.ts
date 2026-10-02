import type { CommentResponse } from '../../application/comments/comment.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class CommentHttpResponse {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly authorMemberId: string,
    public readonly targetType: string,
    public readonly targetId: string,
    public readonly body: string,
  ) {}
}
export function toCommentHttpResponse(item: CommentResponse): CommentHttpResponse {
  return new CommentHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.authorMemberId, item.targetType, item.targetId, item.body);
}
export class CommentItemHttpResponse {
  constructor(public readonly item: CommentHttpResponse) {}
}
export class CommentsPageHttpResponse {
  constructor(public readonly items: readonly CommentHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteCommentHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
