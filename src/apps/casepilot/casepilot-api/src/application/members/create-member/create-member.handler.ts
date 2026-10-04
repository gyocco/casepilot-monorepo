import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Member } from '../../../domain/entities/member.js';
import { CreateMemberResponse } from './create-member.response.js';
import { toMemberResponse } from '../shared/member.response.js';
import { type CreateMemberRequest } from './create-member.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { memberFields, validateMemberRelations } from '../shared/member.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateMemberHandler implements Handler<CreateMemberRequest, CreateMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Member>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateMemberRequest): Promise<CreateMemberResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, memberFields, false);
      const entity = new Member();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.userId = request.data.userId;
      entity.role = request.data.role;
      entity.status = request.data.status;
      entity.title = request.data.title ?? null;
      entity.professionalRegistration = request.data.professionalRegistration ?? null;
      entity.hourlyRate = request.data.hourlyRate ?? null;
      entity.joinedAt = request.data.joinedAt ?? null;
      entity.invitedAt = request.data.invitedAt ?? null;
      await validateMemberRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateMemberResponse(toMemberResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
