import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Comment } from '../../domain/entities/comment.js';
import { CreateCommentResponse, toCommentResponse, type CreateCommentRequest } from './comment.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { commentFields, validateCommentRelations } from './comment.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateCommentHandler implements Handler<CreateCommentRequest, CreateCommentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Comment>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCommentRequest): Promise<CreateCommentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, commentFields, false);
      const entity = new Comment();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.authorMemberId = request.data.authorMemberId;
      entity.targetType = request.data.targetType;
      entity.targetId = request.data.targetId;
      entity.body = request.data.body;
      await validateCommentRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCommentResponse(toCommentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
