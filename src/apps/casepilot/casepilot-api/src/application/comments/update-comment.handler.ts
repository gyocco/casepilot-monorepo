import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Comment } from '../../domain/entities/comment.js';
import { UpdateCommentResponse, toCommentResponse, type UpdateCommentRequest } from './comment.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { commentFields, validateCommentRelations } from './comment.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCommentHandler implements Handler<UpdateCommentRequest, UpdateCommentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Comment>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCommentRequest): Promise<UpdateCommentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, commentFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Comment();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.authorMemberId = request.data.authorMemberId !== undefined ? request.data.authorMemberId : existing.authorMemberId;
      entity.targetType = request.data.targetType !== undefined ? request.data.targetType : existing.targetType;
      entity.targetId = request.data.targetId !== undefined ? request.data.targetId : existing.targetId;
      entity.body = request.data.body !== undefined ? request.data.body : existing.body;
      await validateCommentRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCommentResponse(toCommentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
