import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { StatusDefinition } from '../../../domain/entities/status-definition.js';
import { UpdateStatusDefinitionResponse } from './update-status-definition.response.js';
import { toStatusDefinitionResponse } from '../shared/status-definition.response.js';
import { type UpdateStatusDefinitionRequest } from './update-status-definition.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { status_definitionFields, validateStatusDefinitionRelations } from '../shared/status-definition.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateStatusDefinitionHandler implements Handler<UpdateStatusDefinitionRequest, UpdateStatusDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<StatusDefinition>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateStatusDefinitionRequest): Promise<UpdateStatusDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'write');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, status_definitionFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new StatusDefinition();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.entityType = request.data.entityType !== undefined ? request.data.entityType : existing.entityType;
      entity.caseTypeId = request.data.caseTypeId !== undefined ? request.data.caseTypeId : existing.caseTypeId;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.code = request.data.code !== undefined ? request.data.code : existing.code;
      entity.category = request.data.category !== undefined ? request.data.category : existing.category;
      entity.sortOrder = request.data.sortOrder !== undefined ? request.data.sortOrder : existing.sortOrder;
      entity.isInitial = request.data.isInitial !== undefined ? request.data.isInitial : existing.isInitial;
      entity.isTerminal = request.data.isTerminal !== undefined ? request.data.isTerminal : existing.isTerminal;
      entity.isActive = request.data.isActive !== undefined ? request.data.isActive : existing.isActive;
      await validateStatusDefinitionRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateStatusDefinitionResponse(toStatusDefinitionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
