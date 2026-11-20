import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { CaseExternalParty } from '../../../domain/entities/case-external-party.js';
import { CreateCaseExternalPartyResponse } from './create-case-external-party.response.js';
import { toCaseExternalPartyResponse } from '../shared/case-external-party.response.js';
import { type CreateCaseExternalPartyRequest } from './create-case-external-party.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { case_external_partyFields, validateCaseExternalPartyRelations } from '../shared/case-external-party.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateCaseExternalPartyHandler implements Handler<CreateCaseExternalPartyRequest, CreateCaseExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseExternalParty>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCaseExternalPartyRequest): Promise<CreateCaseExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, case_external_partyFields, false);
      const entity = new CaseExternalParty();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId;
      entity.externalPartyId = request.data.externalPartyId;
      entity.role = request.data.role;
      entity.isPrimary = request.data.isPrimary;
      entity.notes = request.data.notes ?? null;
      await validateCaseExternalPartyRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCaseExternalPartyResponse(toCaseExternalPartyResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
