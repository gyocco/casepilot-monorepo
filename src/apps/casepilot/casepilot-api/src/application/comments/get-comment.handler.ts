import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Comment } from '../../domain/entities/comment.js';
import { GetCommentResponse, toCommentResponse, type GetCommentRequest } from './comment.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCommentHandler implements Handler<GetCommentRequest, GetCommentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Comment>>) {}

  async execute(request: GetCommentRequest): Promise<GetCommentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCommentResponse(toCommentResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
