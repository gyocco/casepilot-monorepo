import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CaseType } from '../../domain/entities/case-type.js';
import { UpdateCaseTypeResponse, toCaseTypeResponse, type UpdateCaseTypeRequest } from './case-type.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { case_typeFields, validateCaseTypeRelations } from './case-type.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateCaseTypeHandler implements Handler<UpdateCaseTypeRequest, UpdateCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCaseTypeRequest): Promise<UpdateCaseTypeResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, case_typeFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new CaseType();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.code = request.data.code !== undefined ? request.data.code : existing.code;
      entity.isActive = request.data.isActive !== undefined ? request.data.isActive : existing.isActive;
      entity.defaultWorkflowId = request.data.defaultWorkflowId !== undefined ? request.data.defaultWorkflowId : existing.defaultWorkflowId;
      await validateCaseTypeRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCaseTypeResponse(toCaseTypeResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
