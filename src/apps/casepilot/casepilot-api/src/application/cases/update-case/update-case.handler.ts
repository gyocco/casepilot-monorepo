import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Case } from '../../../domain/entities/case.js';
import { UpdateCaseResponse } from './update-case.response.js';
import { toCaseResponse } from '../shared/case.response.js';
import { type UpdateCaseRequest } from './update-case.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { caseFields, validateCaseRelations } from '../shared/case.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCaseHandler implements Handler<UpdateCaseRequest, UpdateCaseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Case>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCaseRequest): Promise<UpdateCaseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, caseFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Case();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseTypeId = request.data.caseTypeId !== undefined ? request.data.caseTypeId : existing.caseTypeId;
      entity.number = request.data.number !== undefined ? request.data.number : existing.number;
      entity.externalReference = request.data.externalReference !== undefined ? request.data.externalReference : existing.externalReference;
      entity.title = request.data.title !== undefined ? request.data.title : existing.title;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.priority = request.data.priority !== undefined ? request.data.priority : existing.priority;
      entity.openedAt = request.data.openedAt !== undefined ? request.data.openedAt : existing.openedAt;
      entity.closedAt = request.data.closedAt !== undefined ? request.data.closedAt : existing.closedAt;
      entity.responsibleMemberId = request.data.responsibleMemberId !== undefined ? request.data.responsibleMemberId : existing.responsibleMemberId;
      entity.billingType = request.data.billingType !== undefined ? request.data.billingType : existing.billingType;
      entity.hourlyRate = request.data.hourlyRate !== undefined ? request.data.hourlyRate : existing.hourlyRate;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.createdByMemberId = request.data.createdByMemberId !== undefined ? request.data.createdByMemberId : existing.createdByMemberId;
      await validateCaseRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCaseResponse(toCaseResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
