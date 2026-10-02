import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { CaseType } from '../../domain/entities/case-type.js';
import { CreateCaseTypeResponse, toCaseTypeResponse, type CreateCaseTypeRequest } from './case-type.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { case_typeFields, validateCaseTypeRelations } from './case-type.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateCaseTypeHandler implements Handler<CreateCaseTypeRequest, CreateCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCaseTypeRequest): Promise<CreateCaseTypeResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, case_typeFields, false);
      const entity = new CaseType();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.name = request.data.name;
      entity.description = request.data.description ?? null;
      entity.code = request.data.code ?? null;
      entity.isActive = request.data.isActive;
      entity.defaultWorkflowId = request.data.defaultWorkflowId ?? null;
      await validateCaseTypeRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCaseTypeResponse(toCaseTypeResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
