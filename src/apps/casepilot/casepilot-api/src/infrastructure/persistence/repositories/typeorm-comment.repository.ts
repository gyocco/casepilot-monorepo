import type { EntityManager } from 'typeorm';
import type { Comment } from '../../../domain/entities/comment.js';
import type { CommentRepository } from '../../../domain/repositories/comment.repository.js';
import { commentTable } from '../schemas/comment.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmCommentRepository extends TypeOrmDataRepository<Comment> implements CommentRepository {
  constructor(manager: EntityManager) { super(manager, commentTable); }
}
