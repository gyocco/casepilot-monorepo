import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { Comment } from '../../domain/entities/comment.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmCommentRepository } from '../../infrastructure/persistence/repositories/typeorm-comment.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCommentHandler } from '../../application/comments/create-comment/create-comment.handler.js';
import { GetCommentHandler } from '../../application/comments/get-comment/get-comment.handler.js';
import { UpdateCommentHandler } from '../../application/comments/update-comment/update-comment.handler.js';
import { DeleteCommentHandler } from '../../application/comments/delete-comment/delete-comment.handler.js';
import { ListCommentsHandler } from '../../application/comments/list-comments/list-comments.handler.js';
import { CommentsController } from './comments.controller.js';
const WORK = Symbol('Comments_WORK');
@Module({
  controllers: [CommentsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Comment>> =>
        new TypeOrmUnitOfWork<CrudScope<Comment>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCommentRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateCommentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Comment>>): CreateCommentHandler => new CreateCommentHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCommentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Comment>>): GetCommentHandler => new GetCommentHandler(work),
    },
    {
      provide: UpdateCommentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Comment>>): UpdateCommentHandler => new UpdateCommentHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCommentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Comment>>): DeleteCommentHandler => new DeleteCommentHandler(work),
    },
    {
      provide: ListCommentsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Comment>>): ListCommentsHandler => new ListCommentsHandler(work),
    },
  ],
})
export class CommentsModule {}
