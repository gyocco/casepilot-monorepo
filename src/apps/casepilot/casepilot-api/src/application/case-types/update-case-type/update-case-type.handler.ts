import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { CaseType } from '../../../domain/entities/case-type.js';
import { UpdateCaseTypeResponse } from './update-case-type.response.js';
import { toCaseTypeResponse } from '../shared/case-type.response.js';
import { type UpdateCaseTypeRequest } from './update-case-type.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { case_typeFields, validateCaseTypeRelations } from '../shared/case-type.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateCaseTypeHandler implements Handler<UpdateCaseTypeRequest, UpdateCaseTypeResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseType>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCaseTypeRequest): Promise<UpdateCaseTypeResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
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
