import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Member } from '../../domain/entities/member.js';
import { UpdateMemberResponse, toMemberResponse, type UpdateMemberRequest } from './member.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { memberFields, validateMemberRelations } from './member.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateMemberHandler implements Handler<UpdateMemberRequest, UpdateMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Member>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateMemberRequest): Promise<UpdateMemberResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, memberFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Member();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.userId = request.data.userId !== undefined ? request.data.userId : existing.userId;
      entity.role = request.data.role !== undefined ? request.data.role : existing.role;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.professionalRegistration = request.data.professionalRegistration !== undefined ? request.data.professionalRegistration : existing.professionalRegistration;
      entity.hourlyRate = request.data.hourlyRate !== undefined ? request.data.hourlyRate : existing.hourlyRate;
      entity.joinedAt = request.data.joinedAt !== undefined ? request.data.joinedAt : existing.joinedAt;
      entity.invitedAt = request.data.invitedAt !== undefined ? request.data.invitedAt : existing.invitedAt;
      await validateMemberRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateMemberResponse(toMemberResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
