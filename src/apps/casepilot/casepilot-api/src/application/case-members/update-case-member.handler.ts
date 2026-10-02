import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CaseMember } from '../../domain/entities/case-member.js';
import { UpdateCaseMemberResponse, toCaseMemberResponse, type UpdateCaseMemberRequest } from './case-member.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { case_memberFields, validateCaseMemberRelations } from './case-member.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateCaseMemberHandler implements Handler<UpdateCaseMemberRequest, UpdateCaseMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseMember>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCaseMemberRequest): Promise<UpdateCaseMemberResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, case_memberFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new CaseMember();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.memberId = request.data.memberId !== undefined ? request.data.memberId : existing.memberId;
      entity.role = request.data.role !== undefined ? request.data.role : existing.role;
      entity.isPrimary = request.data.isPrimary !== undefined ? request.data.isPrimary : existing.isPrimary;
      entity.assignedAt = request.data.assignedAt !== undefined ? request.data.assignedAt : existing.assignedAt;
      entity.removedAt = request.data.removedAt !== undefined ? request.data.removedAt : existing.removedAt;
      await validateCaseMemberRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCaseMemberResponse(toCaseMemberResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
