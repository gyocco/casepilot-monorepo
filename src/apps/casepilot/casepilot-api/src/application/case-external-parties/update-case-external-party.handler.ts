import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CaseExternalParty } from '../../domain/entities/case-external-party.js';
import { UpdateCaseExternalPartyResponse, toCaseExternalPartyResponse, type UpdateCaseExternalPartyRequest } from './case-external-party.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { case_external_partyFields, validateCaseExternalPartyRelations } from './case-external-party.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCaseExternalPartyHandler implements Handler<UpdateCaseExternalPartyRequest, UpdateCaseExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseExternalParty>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCaseExternalPartyRequest): Promise<UpdateCaseExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, case_external_partyFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new CaseExternalParty();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.externalPartyId = request.data.externalPartyId !== undefined ? request.data.externalPartyId : existing.externalPartyId;
      entity.role = request.data.role !== undefined ? request.data.role : existing.role;
      entity.isPrimary = request.data.isPrimary !== undefined ? request.data.isPrimary : existing.isPrimary;
      entity.notes = request.data.notes !== undefined ? request.data.notes : existing.notes;
      await validateCaseExternalPartyRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCaseExternalPartyResponse(toCaseExternalPartyResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
