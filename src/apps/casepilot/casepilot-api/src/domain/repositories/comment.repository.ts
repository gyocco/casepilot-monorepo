import type { DataRepository } from './data.repository.js';
import type { Comment } from '../entities/comment.js';
export interface CommentRepository extends DataRepository<Comment> {
  readonly entityType?: Comment;
}
