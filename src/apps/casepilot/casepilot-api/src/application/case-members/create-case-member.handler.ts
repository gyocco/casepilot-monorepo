import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { CaseMember } from '../../domain/entities/case-member.js';
import { CreateCaseMemberResponse, toCaseMemberResponse, type CreateCaseMemberRequest } from './case-member.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { case_memberFields, validateCaseMemberRelations } from './case-member.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateCaseMemberHandler implements Handler<CreateCaseMemberRequest, CreateCaseMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseMember>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCaseMemberRequest): Promise<CreateCaseMemberResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, case_memberFields, false);
      const entity = new CaseMember();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId;
      entity.memberId = request.data.memberId;
      entity.role = request.data.role ?? null;
      entity.isPrimary = request.data.isPrimary;
      entity.assignedAt = request.data.assignedAt;
      entity.removedAt = request.data.removedAt ?? null;
      await validateCaseMemberRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCaseMemberResponse(toCaseMemberResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
