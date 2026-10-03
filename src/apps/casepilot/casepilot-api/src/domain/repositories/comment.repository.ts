import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Comment } from '../entities/comment.js';
export interface CommentRepository extends DataRepository<Comment> {
  readonly entityType?: Comment;
}
