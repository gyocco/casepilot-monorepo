import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Case } from '../../../domain/entities/case.js';
import { CreateCaseResponse } from './create-case.response.js';
import { toCaseResponse } from '../shared/case.response.js';
import { type CreateCaseRequest } from './create-case.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { caseFields, validateCaseRelations } from '../shared/case.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateCaseHandler implements Handler<CreateCaseRequest, CreateCaseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Case>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCaseRequest): Promise<CreateCaseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, caseFields, false);
      const entity = new Case();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseTypeId = request.data.caseTypeId ?? null;
      entity.number = request.data.number ?? null;
      entity.externalReference = request.data.externalReference ?? null;
      entity.title = request.data.title;
      entity.description = request.data.description ?? null;
      entity.status = request.data.status;
      entity.priority = request.data.priority ?? null;
      entity.openedAt = request.data.openedAt ?? null;
      entity.closedAt = request.data.closedAt ?? null;
      entity.responsibleMemberId = request.data.responsibleMemberId ?? null;
      entity.billingType = request.data.billingType ?? null;
      entity.hourlyRate = request.data.hourlyRate ?? null;
      entity.currency = request.data.currency ?? null;
      entity.createdByMemberId = request.data.createdByMemberId;
      await validateCaseRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCaseResponse(toCaseResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
