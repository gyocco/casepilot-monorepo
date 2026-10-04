import { Response } from '@casepilot/cqrs';
import type { Comment } from '../../../domain/entities/comment.js';

export class CommentResponse extends Response {
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
  ) { super(); }
}
export function toCommentResponse(entity: Comment): CommentResponse {
  return new CommentResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.authorMemberId, entity.targetType, entity.targetId, entity.body);
}
